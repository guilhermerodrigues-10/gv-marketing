import { supabase } from './supabase';
import { Task, User, Project, Notification, Asset, Column } from '../types';

// ============= USERS =============
export const userAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(user: Omit<User, 'id'>) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: user.name,
        email: user.email,
        avatar_url: user.avatarUrl,
        role: user.role,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        email: updates.email,
        avatar_url: updates.avatarUrl,
        role: updates.role,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// ============= PROJECTS =============
export const projectAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_members (
          user_id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform to match Project interface
    return data.map((project: any) => ({
      id: project.id,
      name: project.name,
      clientName: project.client_name,
      budget: project.budget,
      color: project.color,
      members: project.project_members.map((pm: any) => pm.user_id)
    }));
  },

  async create(project: Omit<Project, 'id' | 'members'>, memberIds: string[] = []) {
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: project.name,
        client_name: project.clientName,
        budget: project.budget,
        color: project.color,
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Add members
    if (memberIds.length > 0) {
      const { error: membersError } = await supabase
        .from('project_members')
        .insert(memberIds.map(userId => ({
          project_id: projectData.id,
          user_id: userId
        })));

      if (membersError) throw membersError;
    }

    return {
      ...projectData,
      members: memberIds
    };
  },

  async update(id: string, updates: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        client_name: updates.clientName,
        budget: updates.budget,
        color: updates.color,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async addMember(projectId: string, userId: string) {
    const { error } = await supabase
      .from('project_members')
      .insert({ project_id: projectId, user_id: userId });

    if (error) throw error;
  },

  async removeMember(projectId: string, userId: string) {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) throw error;
  }
};

// ============= TASKS =============
export const taskAPI = {
  async getAll() {
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        task_assignees (
          user_id
        ),
        subtasks (*),
        attachments (*)
      `)
      .order('created_at', { ascending: false });

    if (tasksError) throw tasksError;

    // Transform to match Task interface
    return tasksData.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignees: task.task_assignees.map((ta: any) => ta.user_id),
      dueDate: task.due_date,
      projectId: task.project_id,
      tags: task.tags || [],
      subtasks: task.subtasks.map((st: any) => ({
        id: st.id,
        title: st.title,
        completed: st.completed
      })),
      attachments: task.attachments.map((att: any) => ({
        id: att.id,
        name: att.name,
        url: att.url,
        type: att.type
      })),
      timeTracked: task.time_tracked || 0,
      isTracking: task.is_tracking || false,
      createdAt: task.created_at
    }));
  },

  async create(task: Omit<Task, 'id' | 'createdAt' | 'timeTracked' | 'isTracking' | 'attachments'>) {
    console.log('📝 Creating task:', task);

    // Create task
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate || null,
        project_id: task.projectId,
        tags: task.tags || [],
      })
      .select()
      .single();

    if (taskError) {
      console.error('❌ Task creation error:', taskError);
      throw taskError;
    }
    console.log('✅ Task created:', taskData);

    // Add assignees
    if (task.assignees.length > 0) {
      const { error: assigneesError } = await supabase
        .from('task_assignees')
        .insert(task.assignees.map(userId => ({
          task_id: taskData.id,
          user_id: userId
        })));

      if (assigneesError) throw assigneesError;
    }

    // Add subtasks
    if (task.subtasks.length > 0) {
      const { error: subtasksError } = await supabase
        .from('subtasks')
        .insert(task.subtasks.map(st => ({
          task_id: taskData.id,
          title: st.title,
          completed: st.completed
        })));

      if (subtasksError) throw subtasksError;
    }

    return taskData;
  },

  async update(id: string, updates: Partial<Task>) {
    const updateData: any = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
    if (updates.projectId !== undefined) updateData.project_id = updates.projectId;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.timeTracked !== undefined) updateData.time_tracked = updates.timeTracked;
    if (updates.isTracking !== undefined) updateData.is_tracking = updates.isTracking;

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// ============= NOTIFICATIONS =============
export const notificationAPI = {
  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(notification: Omit<Notification, 'id' | 'date' | 'read'>, userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);

    if (error) throw error;
  }
};

// ============= BOARD COLUMNS =============
export const columnAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('board_columns')
      .select('*')
      .order('position', { ascending: true });

    if (error) throw error;

    return data.map((col: any) => ({
      id: col.id,
      title: col.title
    }));
  },

  async create(title: string, position: number) {
    const id = title.toLowerCase().replace(/\s+/g, '_');
    const { data, error } = await supabase
      .from('board_columns')
      .insert({ id, title, position })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, title: string) {
    const { data, error } = await supabase
      .from('board_columns')
      .update({ title })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('board_columns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// ============= ASSETS =============
export const assetAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(asset: Omit<Asset, 'id' | 'uploadedAt'>) {
    const { data, error } = await supabase
      .from('assets')
      .insert({
        name: asset.name,
        url: asset.url,
        path: asset.path,
        type: asset.type,
        mime_type: asset.mimeType,
        size: asset.size,
        project_id: asset.projectId,
        tags: asset.tags,
        uploaded_by: asset.uploadedBy,
        thumbnail_url: asset.thumbnailUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
