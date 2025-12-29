import { apiClient } from './api';

export interface ITDemand {
  id: string;
  title: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  requesterId?: string;
  urgency: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateITDemandInput {
  title: string;
  description: string;
  urgency: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
}

export const itDemandsAPI = {
  // Get all IT demands (Admin only)
  getAll: async (): Promise<ITDemand[]> => {
    const response = await apiClient.get('/it-demands');
    return response.data.map((demand: any) => ({
      id: demand.id,
      title: demand.title,
      description: demand.description,
      requesterName: demand.requester_name,
      requesterEmail: demand.requester_email,
      requesterId: demand.requester_id,
      urgency: demand.urgency,
      status: demand.status,
      createdAt: demand.created_at,
      updatedAt: demand.updated_at
    }));
  },

  // Get single IT demand
  getById: async (id: string): Promise<ITDemand> => {
    const response = await apiClient.get(`/it-demands/${id}`);
    const demand = response.data;
    return {
      id: demand.id,
      title: demand.title,
      description: demand.description,
      requesterName: demand.requester_name,
      requesterEmail: demand.requester_email,
      requesterId: demand.requester_id,
      urgency: demand.urgency,
      status: demand.status,
      createdAt: demand.created_at,
      updatedAt: demand.updated_at
    };
  },

  // Create new IT demand
  create: async (data: CreateITDemandInput): Promise<ITDemand> => {
    const response = await apiClient.post('/it-demands', data);
    const demand = response.data;
    return {
      id: demand.id,
      title: demand.title,
      description: demand.description,
      requesterName: demand.requester_name,
      requesterEmail: demand.requester_email,
      requesterId: demand.requester_id,
      urgency: demand.urgency,
      status: demand.status,
      createdAt: demand.created_at,
      updatedAt: demand.updated_at
    };
  },

  // Update IT demand status (Admin only)
  updateStatus: async (id: string, status: string): Promise<ITDemand> => {
    const response = await apiClient.put(`/it-demands/${id}`, { status });
    const demand = response.data;
    return {
      id: demand.id,
      title: demand.title,
      description: demand.description,
      requesterName: demand.requester_name,
      requesterEmail: demand.requester_email,
      requesterId: demand.requester_id,
      urgency: demand.urgency,
      status: demand.status,
      createdAt: demand.created_at,
      updatedAt: demand.updated_at
    };
  },

  // Delete IT demand (Admin only)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/it-demands/${id}`);
  }
};
