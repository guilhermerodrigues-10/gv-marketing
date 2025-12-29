import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { useApp } from '../../contexts/AppContext';

interface ITDemand {
  id: string;
  title: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  urgency: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  status: string;
  createdAt: string;
}

interface ITDemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  demand: ITDemand | null;
}

export const ITDemandModal: React.FC<ITDemandModalProps> = ({ isOpen, onClose, demand }) => {
  const { user } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requesterName: user?.name || '',
    requesterEmail: user?.email || '',
    urgency: 'Média' as 'Baixa' | 'Média' | 'Alta' | 'Crítica'
  });

  useEffect(() => {
    if (demand) {
      setFormData({
        title: demand.title,
        description: demand.description,
        requesterName: demand.requesterName,
        requesterEmail: demand.requesterEmail,
        urgency: demand.urgency
      });
    } else {
      setFormData({
        title: '',
        description: '',
        requesterName: user?.name || '',
        requesterEmail: user?.email || '',
        urgency: 'Média'
      });
    }
  }, [demand, isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Por favor, preencha o título da demanda');
      return;
    }

    if (!formData.description.trim()) {
      alert('Por favor, descreva a demanda');
      return;
    }

    // TODO: Integrate with backend API
    console.log('Submitting IT Demand:', formData);

    alert('Demanda enviada com sucesso! A equipe de TI irá analisá-la em breve.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {demand ? 'Detalhes da Demanda' : 'Nova Demanda TI'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Título da Demanda"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Ex: Problema no upload de arquivos"
              disabled={!!demand}
            />

            <Textarea
              label="Descrição"
              rows={6}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva detalhadamente o problema ou solicitação..."
              required
              disabled={!!demand}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Seu Nome"
                value={formData.requesterName}
                onChange={e => setFormData({ ...formData, requesterName: e.target.value })}
                required
                disabled={!!demand}
              />

              <Input
                label="Seu Email"
                type="email"
                value={formData.requesterEmail}
                onChange={e => setFormData({ ...formData, requesterEmail: e.target.value })}
                required
                disabled={!!demand}
              />
            </div>

            <Select
              label="Urgência"
              options={[
                { label: 'Baixa - Pode aguardar', value: 'Baixa' },
                { label: 'Média - Atenção normal', value: 'Média' },
                { label: 'Alta - Precisa de atenção', value: 'Alta' },
                { label: 'Crítica - Urgente!', value: 'Crítica' }
              ]}
              value={formData.urgency}
              onChange={e => setFormData({ ...formData, urgency: e.target.value as any })}
              disabled={!!demand}
            />

            {demand && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  <strong>Status atual:</strong> {demand.status}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                  Criada em: {new Date(demand.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={onClose}>
              {demand ? 'Fechar' : 'Cancelar'}
            </Button>
            {!demand && <Button type="submit">Enviar Demanda</Button>}
          </div>
        </form>
      </div>
    </div>
  );
};
