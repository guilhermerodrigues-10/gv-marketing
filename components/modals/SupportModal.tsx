import React, { useState } from 'react';
import { X, Phone } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { useApp } from '../../contexts/AppContext';
import { itDemandsAPI } from '../../lib/itDemandsAPI';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { user } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requesterName: user?.name || '',
    requesterEmail: user?.email || '',
    urgency: 'Média' as 'Baixa' | 'Média' | 'Alta' | 'Crítica'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Por favor, preencha o título da sua dúvida');
      return;
    }

    if (!formData.description.trim()) {
      alert('Por favor, descreva sua dúvida ou problema');
      return;
    }

    try {
      await itDemandsAPI.create({
        title: formData.title,
        description: formData.description,
        urgency: formData.urgency
      });

      alert('Solicitação enviada! A equipe de TI entrará em contato em breve.');

      // Reset form
      setFormData({
        title: '',
        description: '',
        requesterName: user?.name || '',
        requesterEmail: user?.email || '',
        urgency: 'Média'
      });

      onClose();
    } catch (error) {
      console.error('Error submitting support request:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
              <Phone size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Suporte TI
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 dark:text-blue-400">
              <strong>Precisa de ajuda?</strong> Descreva sua dúvida ou problema e a equipe de TI irá te auxiliar.
            </p>
          </div>

          <Input
            label="Assunto"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Ex: Dúvida sobre criação de tarefas"
          />

          <Textarea
            label="Descreva sua dúvida ou problema"
            rows={5}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Explique detalhadamente o que você precisa..."
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Seu Nome"
              value={formData.requesterName}
              readOnly
              className="bg-slate-50 dark:bg-slate-800"
            />

            <Input
              label="Seu Email"
              type="email"
              value={formData.requesterEmail}
              readOnly
              className="bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <Select
            label="Urgência"
            options={[
              { label: 'Baixa - Posso aguardar', value: 'Baixa' },
              { label: 'Média - Normal', value: 'Média' },
              { label: 'Alta - Preciso de atenção', value: 'Alta' },
              { label: 'Crítica - Urgente!', value: 'Crítica' }
            ]}
            value={formData.urgency}
            onChange={e => setFormData({ ...formData, urgency: e.target.value as any })}
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Enviar Solicitação
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
