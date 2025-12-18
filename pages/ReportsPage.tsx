import React, { useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TaskStatus } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ReportsPage: React.FC = () => {
  const { tasks, projects, users, columns } = useApp();
  const reportRef = useRef<HTMLDivElement>(null);

  // Data 1: Tasks by User (Workload)
  const workloadData = users.map(u => ({
    name: u.name,
    tasks: tasks.filter(t => t.assignees.includes(u.id)).length
  }));

  // Data 2: Completed Tasks by User
  const completedTasksData = users.map(u => {
    const userTasks = tasks.filter(t => t.assignees.includes(u.id));
    const completed = userTasks.filter(t => t.status === TaskStatus.DONE || t.status === 'done').length;
    return {
      name: u.name,
      completed: completed,
      total: userTasks.length
    };
  });

  // Data 3: Completion Velocity (Mocked over last 5 weeks)
  const velocityData = [
    { name: 'Semana 1', completed: 4 },
    { name: 'Semana 2', completed: 7 },
    { name: 'Semana 3', completed: 5 },
    { name: 'Semana 4', completed: 11 },
    { name: 'Semana Atual', completed: tasks.filter(t => t.status === TaskStatus.DONE || t.status === 'done').length }
  ];

  // Export to PDF function
  const exportToPDF = async () => {
    if (!reportRef.current) return;

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`relatorio-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Relatórios Avançados</h1>
          <p className="text-slate-500 dark:text-slate-400">Análise de desempenho da equipe</p>
        </div>
        <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white border border-primary-600 rounded-lg text-sm font-medium transition-colors"
            >
              Exportar PDF
            </button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-8">

      {/* Row 1: Workload & Costs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Workload */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Carga de Trabalho por Membro</h3>
           <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={workloadData} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                 <XAxis type="number" stroke="#94a3b8" />
                 <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" tick={{fontSize: 12}} />
                 <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                 <Bar dataKey="tasks" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} name="Tarefas" />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Tarefas Concluídas por Membro</h3>
           <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={completedTasksData} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                 <XAxis type="number" stroke="#94a3b8" />
                 <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" tick={{fontSize: 12}} />
                 <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                 <Bar dataKey="completed" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} name="Concluídas" />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Row 2: Velocity Area Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
         <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Velocidade da Equipe (Tarefas Concluídas)</h3>
         <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="completed" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCompleted)" name="Concluídas" />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
      </div>
    </div>
  );
};