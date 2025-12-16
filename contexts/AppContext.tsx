import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, User, Project, Column, Notification } from '../types';
import { INITIAL_TASKS, MOCK_USERS, MOCK_PROJECTS, BOARD_COLUMNS } from '../constants';
import { authAPI } from '../lib/api';
import { taskAPI, projectAPI, userAPI, columnAPI } from '../lib/supabase-helpers';

interface AppState {
  user: User | null;
  users: User[];
  tasks: Task[];
  projects: Project[];
  columns: Column[];
  notifications: Notification[];
  isDarkMode: boolean;
  activeTaskId: string | null;
  sidebarOpen: boolean;
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'timeTracked' | 'isTracking' | 'attachments'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: string) => void;
  setActiveDragTask: (taskId: string | null) => void;
  toggleTimeTracking: (taskId: string) => void;

  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'members'>) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  toggleProjectMember: (projectId: string, userId: string) => void;

  // Column Actions
  addColumn: (title: string) => void;
  updateColumn: (columnId: string, title: string) => void;
  deleteColumn: (columnId: string) => void;

  // Team Actions
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;

  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [columns, setColumns] = useState<Column[]>(BOARD_COLUMNS);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'n1', title: 'Bem-vindo!', message: 'Seu cadastro foi realizado com sucesso.', date: new Date().toISOString(), read: false, type: 'success' },
    { id: 'n2', title: 'Prazo Próximo', message: 'A tarefa "Design Dashboard" vence amanhã.', date: new Date(Date.now() - 3600000).toISOString(), read: false, type: 'warning' }
  ]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load theme preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Recover session on load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUser(user);

        // Verify if token is still valid
        authAPI.verify().catch(() => {
          // Token expired or invalid
          localStorage.clear();
          setUser(null);
        });
      } catch {
        localStorage.clear();
      }
    }
  }, []);

  // Apply theme class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load initial data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('📥 Carregando dados do Supabase...');

        // Carregar tarefas
        const tasksData = await taskAPI.getAll();
        if (tasksData.length > 0) {
          setTasks(tasksData);
          console.log(`✅ ${tasksData.length} tarefa(s) carregada(s)`);
        }

        // Carregar projetos
        const projectsData = await projectAPI.getAll();
        if (projectsData.length > 0) {
          setProjects(projectsData);
          console.log(`✅ ${projectsData.length} projeto(s) carregado(s)`);
        }

        // Carregar colunas
        const columnsData = await columnAPI.getAll();
        if (columnsData.length > 0) {
          setColumns(columnsData);
          console.log(`✅ ${columnsData.length} coluna(s) carregada(s)`);
        }

        console.log('✅ Dados carregados do Supabase');
      } catch (error) {
        console.error('❌ Erro ao carregar dados do Supabase:', error);
        console.log('⚠️ Usando dados mock locais');
      }
    };

    loadData();
  }, []);

  // Simulate time tracking interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => prev.map(t => 
        t.isTracking ? { ...t, timeTracked: t.timeTracked + 1 } : t
      ));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });

      // Salvar token e usuário no localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Atualizar state
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Para que LoginPage possa capturar
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // --- Task Logic com Supabase ---
  const addTask = async (newTaskData: Omit<Task, 'id' | 'createdAt' | 'timeTracked' | 'isTracking' | 'attachments'>) => {
    try {
      // Criar no Supabase
      await taskAPI.create(newTaskData);

      // Recarregar lista
      const updatedTasks = await taskAPI.getAll();
      setTasks(updatedTasks);

      addNotification({ title: 'Nova Tarefa', message: `Tarefa "${newTaskData.title}" criada.`, type: 'info' });
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      addNotification({ title: 'Erro', message: 'Não foi possível criar a tarefa.', type: 'error' });
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      // Atualizar localmente primeiro (UI responsiva)
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));

      // Atualizar no Supabase
      await taskAPI.update(taskId, updates);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      // Reverter mudança local em caso de erro
      const updatedTasks = await taskAPI.getAll();
      setTasks(updatedTasks);
      addNotification({ title: 'Erro', message: 'Não foi possível atualizar a tarefa.', type: 'error' });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await taskAPI.delete(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      addNotification({ title: 'Erro', message: 'Não foi possível deletar a tarefa.', type: 'error' });
    }
  };

  const moveTask = async (taskId: string, newStatus: string) => {
    try {
      // Atualizar localmente primeiro (UI responsiva)
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

      // Atualizar no Supabase
      await taskAPI.update(taskId, { status: newStatus });
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      // Reverter mudança local
      const updatedTasks = await taskAPI.getAll();
      setTasks(updatedTasks);
    }
  };

  const toggleTimeTracking = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Atualizar localmente primeiro
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) return { ...t, isTracking: !t.isTracking };
        return t;
      }));

      // Atualizar no Supabase
      await taskAPI.update(taskId, { isTracking: !task.isTracking });
    } catch (error) {
      console.error('Erro ao alternar tracking:', error);
    }
  };

  // --- Project Logic com Supabase ---
  const addProject = async (projectData: Omit<Project, 'id' | 'members'>) => {
    try {
      const memberIds = [user?.id || users[0].id];
      await projectAPI.create(projectData, memberIds);

      // Recarregar projetos
      const updatedProjects = await projectAPI.getAll();
      setProjects(updatedProjects);

      addNotification({ title: 'Novo Projeto', message: `Projeto "${projectData.name}" criado.`, type: 'success' });
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      addNotification({ title: 'Erro', message: 'Não foi possível criar o projeto.', type: 'error' });
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      // Atualizar localmente primeiro
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));

      // Atualizar no Supabase
      await projectAPI.update(projectId, updates);
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      // Reverter
      const updatedProjects = await projectAPI.getAll();
      setProjects(updatedProjects);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await projectAPI.delete(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setTasks(prev => prev.filter(t => t.projectId !== projectId));
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      addNotification({ title: 'Erro', message: 'Não foi possível deletar o projeto.', type: 'error' });
    }
  };

  const toggleProjectMember = async (projectId: string, userId: string) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      const isMember = project.members.includes(userId);

      if (isMember) {
        await projectAPI.removeMember(projectId, userId);
      } else {
        await projectAPI.addMember(projectId, userId);
      }

      // Atualizar localmente
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            members: isMember
              ? p.members.filter(id => id !== userId)
              : [...p.members, userId]
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Erro ao alternar membro do projeto:', error);
    }
  };

  // --- Column Logic com Supabase ---
  const addColumn = async (title: string) => {
    try {
      const position = columns.length;
      await columnAPI.create(title, position);

      // Recarregar colunas
      const updatedColumns = await columnAPI.getAll();
      setColumns(updatedColumns);
    } catch (error) {
      console.error('Erro ao criar coluna:', error);
    }
  };

  const updateColumn = async (columnId: string, title: string) => {
    try {
      // Atualizar localmente
      setColumns(prev => prev.map(c => c.id === columnId ? { ...c, title } : c));

      // Atualizar no Supabase
      await columnAPI.update(columnId, title);
    } catch (error) {
      console.error('Erro ao atualizar coluna:', error);
      // Reverter
      const updatedColumns = await columnAPI.getAll();
      setColumns(updatedColumns);
    }
  };

  const deleteColumn = async (columnId: string) => {
    if (confirm('Tem certeza? Tarefas nesta coluna serão movidas para o Backlog.')) {
      try {
        await columnAPI.delete(columnId);

        setColumns(prev => prev.filter(c => c.id !== columnId));
        const fallbackColumn = columns[0].id === columnId ? columns[1]?.id : columns[0].id;
        if (fallbackColumn) {
          setTasks(prev => prev.map(t => t.status === columnId ? { ...t, status: fallbackColumn } : t));
        }
      } catch (error) {
        console.error('Erro ao deletar coluna:', error);
      }
    }
  };

  // --- User Logic ---
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser = { ...userData, id: `u${Date.now()}` };
    setUsers([...users, newUser]);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (user?.id === userId) {
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }
    addNotification({ title: 'Usuário Atualizado', message: 'Dados do usuário foram alterados.', type: 'info' });
  };

  const deleteUser = (userId: string) => {
    // Prevent deleting yourself
    if (user?.id === userId) {
      alert('Você não pode remover sua própria conta!');
      return;
    }

    // Remove user from users list
    setUsers(prev => prev.filter(u => u.id !== userId));

    // Remove user from all task assignees
    setTasks(prev => prev.map(task => ({
      ...task,
      assignees: task.assignees.filter(id => id !== userId)
    })));

    // Remove user from all projects
    setProjects(prev => prev.map(project => ({
      ...project,
      members: project.members.filter(id => id !== userId)
    })));

    addNotification({ title: 'Membro Removido', message: 'O membro foi removido da equipe.', type: 'info' });
  };

  // --- Notification Logic ---
  const addNotification = (notif: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...notif,
      id: `n${Date.now()}`,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider value={{
      user, users, tasks, projects, columns, isDarkMode, activeTaskId, sidebarOpen, notifications,
      login, logout, toggleTheme, toggleSidebar,
      addTask, updateTask, deleteTask, moveTask, setActiveDragTask: setActiveTaskId, toggleTimeTracking,
      addProject, updateProject, deleteProject, toggleProjectMember,
      addColumn, updateColumn, deleteColumn,
      addUser, updateUser, deleteUser,
      addNotification, markAsRead, markAllAsRead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};