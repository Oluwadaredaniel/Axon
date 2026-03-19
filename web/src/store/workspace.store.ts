import { create } from 'zustand';
import { workspaceAPI } from '@/lib/api';

interface Route {
  id: string;
  method: string;
  path: string;
  file_path?: string;
  line_number?: number;
  description?: string;
}

interface Workspace {
  id: string;
  name: string;
  framework?: string;
  github_repo?: string;
  created_at: string;
  api_routes?: Route[];
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  routes: Route[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  fetchOne: (id: string) => Promise<void>;
  create: (data: any) => Promise<Workspace>;
  update: (id: string, data: any) => Promise<void>;
  delete: (id: string) => Promise<void>;
  fetchRoutes: (id: string) => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  routes: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const { data } = await workspaceAPI.getAll();
      set({ workspaces: data.workspaces, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  fetchOne: async (id) => {
    set({ loading: true });
    try {
      const { data } = await workspaceAPI.getOne(id);
      set({ currentWorkspace: data.workspace, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  create: async (data) => {
    const { data: res } = await workspaceAPI.create(data);
    set((state) => ({
      workspaces: [res.workspace, ...state.workspaces],
    }));
    return res.workspace;
  },

  update: async (id, data) => {
    const { data: res } = await workspaceAPI.update(id, data);
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === id ? res.workspace : w
      ),
      currentWorkspace:
        state.currentWorkspace?.id === id ? res.workspace : state.currentWorkspace,
    }));
  },

  delete: async (id) => {
    await workspaceAPI.delete(id);
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w.id !== id),
      currentWorkspace:
        state.currentWorkspace?.id === id ? null : state.currentWorkspace,
    }));
  },

  fetchRoutes: async (id) => {
    const { data } = await workspaceAPI.getRoutes(id);
    set({ routes: data.routes });
  },

  setCurrentWorkspace: (workspace) => {
    set({ currentWorkspace: workspace });
  },
}));