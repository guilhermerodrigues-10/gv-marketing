import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, User, Project, Column, Notification } from '../types';
import { INITIAL_TASKS, MOCK_USERS, MOCK_PROJECTS, BOARD_COLUMNS } from '../constants';

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
  login: (email: string) => void;
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

  // Apply theme class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Simulate time tracking interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => prev.map(t => 
        t.isTracking ? { ...t, timeTracked: t.timeTracked + 1 } : t
      ));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const login = (email: string) => {
    const foundUser = users.find(u => u.email === email) || users[0];
    setUser(foundUser);
  };

  const logout = () => setUser(null);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // --- Task Logic ---
  const addTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'timeTracked' | 'isTracking' | 'attachments'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `t${Date.now()}`,
      createdAt: new Date().toISOString(),
      timeTracked: 0,
      isTracking: false,
      attachments: []
    };
    setTasks([...tasks, newTask]);
    addNotification({ title: 'Nova Tarefa', message: `Tarefa "${newTask.title}" criada.`, type: 'info' });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const moveTask = (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const toggleTimeTracking = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) return { ...t, isTracking: !t.isTracking };
      return t;
    }));
  };

  // --- Project Logic ---
  const addProject = (projectData: Omit<Project, 'id' | 'members'>) => {
    const newProject: Project = { 
      ...projectData, 
      id: `p${Date.now()}`,
      members: [user?.id || users[0].id]
    };
    setProjects([...projects, newProject]);
    addNotification({ title: 'Novo Projeto', message: `Projeto "${newProject.name}" criado.`, type: 'success' });
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setTasks(prev => prev.filter(t => t.projectId !== projectId));
  };

  const toggleProjectMember = (projectId: string, userId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const isMember = p.members.includes(userId);
        return {
          ...p,
          members: isMember 
            ? p.members.filter(id => id !== userId) 
            : [...p.members, userId]
        };
      }
      return p;
    }));
  };

  // --- Column Logic ---
  const addColumn = (title: string) => {
    const newId = title.toLowerCase().replace(/\s+/g, '_');
    const newColumn: Column = { id: newId, title };
    setColumns([...columns, newColumn]);
  };

  const updateColumn = (columnId: string, title: string) => {
    setColumns(prev => prev.map(c => c.id === columnId ? { ...c, title } : c));
  };

  const deleteColumn = (columnId: string) => {
    if (confirm('Tem certeza? Tarefas nesta coluna serão movidas para o Backlog.')) {
      setColumns(prev => prev.filter(c => c.id !== columnId));
      const fallbackColumn = columns[0].id === columnId ? columns[1]?.id : columns[0].id;
      if (fallbackColumn) {
        setTasks(prev => prev.map(t => t.status === columnId ? { ...t, status: fallbackColumn } : t));
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