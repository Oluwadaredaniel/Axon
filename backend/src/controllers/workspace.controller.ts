import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export const workspaceController = {

  // Create workspace
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { name, github_repo, framework } = req.body;

      if (!name) return res.status(400).json({ error: 'Workspace name is required' });

      const { data, error } = await supabaseAdmin
        .from('workspaces')
        .insert({ name, user_id: userId, github_repo, framework })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.status(201).json({ workspace: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all workspaces for user
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const { data, error } = await supabaseAdmin
        .from('workspaces')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ workspaces: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get single workspace
  async getOne(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('workspaces')
        .select(`
          *,
          api_routes(*),
          collections(*)
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) return res.status(404).json({ error: 'Workspace not found' });

      return res.json({ workspace: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update workspace
  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { name, github_repo, framework } = req.body;

      const { data, error } = await supabaseAdmin
        .from('workspaces')
        .update({ name, github_repo, framework, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ workspace: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete workspace
  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('workspaces')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ message: 'Workspace deleted successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Save routes detected by VS Code extension
  async saveRoutes(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { routes } = req.body;

      if (!routes || !Array.isArray(routes)) {
        return res.status(400).json({ error: 'Routes array is required' });
      }

      // Verify workspace belongs to user
      const { data: workspace } = await supabaseAdmin
        .from('workspaces')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

      // Delete existing routes and replace with new ones
      await supabaseAdmin
        .from('api_routes')
        .delete()
        .eq('workspace_id', id);

      const routesWithWorkspace = routes.map((route: any) => ({
        ...route,
        workspace_id: id,
      }));

      const { data, error } = await supabaseAdmin
        .from('api_routes')
        .insert(routesWithWorkspace)
        .select();

      if (error) return res.status(400).json({ error: error.message });

      return res.status(201).json({
        message: `${data.length} routes saved successfully`,
        routes: data,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all routes for workspace
  async getRoutes(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const { data: workspace } = await supabaseAdmin
        .from('workspaces')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

      const { data, error } = await supabaseAdmin
        .from('api_routes')
        .select('*')
        .eq('workspace_id', id)
        .order('method', { ascending: true });

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ routes: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};