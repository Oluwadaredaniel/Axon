import { useEffect } from 'react';
import { useWorkspaceStore } from '@/store/workspace.store';
import { useAuthStore } from '@/store/auth.store';

export function useWorkspaces() {
  const { workspaces, loading, fetchAll } = useWorkspaceStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  return { workspaces, loading, fetchAll };
}

export function useWorkspace(id: string) {
  const { currentWorkspace, routes, loading, fetchOne, fetchRoutes } =
    useWorkspaceStore();

  useEffect(() => {
    if (id) {
      fetchOne(id);
      fetchRoutes(id);
    }
  }, [id]);

  return { workspace: currentWorkspace, routes, loading };
}