import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreVertical, Clock, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ITDemandModal } from '../components/modals/ITDemandModal';
import { itDemandsAPI, ITDemand } from '../lib/itDemandsAPI';
import { useSocket } from '../lib/useSocket';

const urgencyColors = {
  'Baixa': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'Média': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Alta': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'Crítica': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
};

const urgencyIcons = {
  'Baixa': CheckCircle,
  'Média': Clock,
  'Alta': AlertTriangle,
  'Crítica': AlertCircle
};

interface DemandCardProps {
  demand: ITDemand;
  onClick: () => void;
}

const DemandCard: React.FC<DemandCardProps> = ({ demand, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: demand.id,
    data: { status: demand.status }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const UrgencyIcon = urgencyIcons[demand.urgency];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-slate-900 dark:text-white flex-1">
          {demand.title}
        </h4>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" onClick={(e) => e.stopPropagation()}>
          <MoreVertical size={16} />
        </button>
      </div>

      {demand.description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
          {demand.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full flex items-center ${urgencyColors[demand.urgency]}`}>
          <UrgencyIcon size={12} className="mr-1" />
          {demand.urgency}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {demand.requesterName}
        </span>
      </div>
    </div>
  );
};

export const ITDemandsPage: React.FC = () => {
  const { user } = useApp();
  const socket = useSocket();
  const [selectedDemand, setSelectedDemand] = useState<ITDemand | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [demands, setDemands] = useState<ITDemand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // IT-specific columns
  const [columns] = useState([
    { id: 'backlog', title: 'Backlog', color: '#64748b' },
    { id: 'em-analise', title: 'Em Análise', color: '#3b82f6' },
    { id: 'em-desenvolvimento', title: 'Em Desenvolvimento', color: '#f59e0b' },
    { id: 'em-teste', title: 'Em Teste', color: '#8b5cf6' },
    { id: 'concluido', title: 'Concluído', color: '#10b981' }
  ]);

  // Load demands from API
  useEffect(() => {
    loadDemands();
  }, []);

  // WebSocket real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleDemandCreated = () => {
      console.log('🔔 New IT demand created, refreshing...');
      loadDemands();
    };

    const handleDemandUpdated = () => {
      console.log('🔔 IT demand updated, refreshing...');
      loadDemands();
    };

    const handleDemandDeleted = () => {
      console.log('🔔 IT demand deleted, refreshing...');
      loadDemands();
    };

    socket.on('it-demand:created', handleDemandCreated);
    socket.on('it-demand:updated', handleDemandUpdated);
    socket.on('it-demand:deleted', handleDemandDeleted);

    return () => {
      socket.off('it-demand:created', handleDemandCreated);
      socket.off('it-demand:updated', handleDemandUpdated);
      socket.off('it-demand:deleted', handleDemandDeleted);
    };
  }, [socket]);

  const loadDemands = async () => {
    try {
      setIsLoading(true);
      const data = await itDemandsAPI.getAll();
      setDemands(data);
    } catch (error) {
      console.error('Error loading IT demands:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the column of the active item
    const activeColumn = active.data.current?.status;

    // Determine the target column
    let targetColumn = overId;

    // If dropped on another item, use that item's column
    if (over.data.current?.status) {
      targetColumn = over.data.current.status;
    }

    // If same column, no update needed
    if (activeColumn === targetColumn) {
      return;
    }

    // Optimistic update
    setDemands(prevDemands =>
      prevDemands.map(demand =>
        demand.id === activeId
          ? { ...demand, status: targetColumn }
          : demand
      )
    );

    // Update on backend
    try {
      await itDemandsAPI.updateStatus(activeId, targetColumn);
    } catch (error) {
      console.error('Error updating demand status:', error);
      // Revert on error
      loadDemands();
    }
  };

  const getDemandsByStatus = (status: string) => {
    return demands.filter(d => d.status === status);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Carregando demandas...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Demandas TI</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gerencie solicitações e suporte técnico
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedDemand(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors whitespace-nowrap"
        >
          <Plus size={20} className="mr-2" />
          Nova Demanda
        </button>
      </div>

      <div className="w-full overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="inline-flex gap-4 pb-4 min-w-full">
            {columns.map(column => {
              const columnDemands = getDemandsByStatus(column.id);

              return (
                <div
                  key={column.id}
                  id={column.id}
                  className="flex-shrink-0 w-80 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 flex flex-col"
                  style={{ maxHeight: 'calc(100vh - 280px)' }}
                >
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: column.color }}
                      />
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {column.title}
                      </h3>
                      <span className="ml-2 px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                        {columnDemands.length}
                      </span>
                    </div>
                  </div>

                  <SortableContext items={columnDemands.map(d => d.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                      {columnDemands.map((demand) => (
                        <DemandCard
                          key={demand.id}
                          demand={demand}
                          onClick={() => {
                            setSelectedDemand(demand);
                            setIsModalOpen(true);
                          }}
                        />
                      ))}
                      {columnDemands.length === 0 && (
                        <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
                          Sem tarefas
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>
        </DndContext>
      </div>

      {isModalOpen && (
        <ITDemandModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDemand(null);
          }}
          demand={selectedDemand}
        />
      )}
    </>
  );
};
