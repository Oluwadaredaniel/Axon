import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export const environmentController = {

  // Create environment
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { workspace_id, name, base_url, variables } = req.body;

      if (!workspace_id || !name || !base_url) {
        return res.status(400).json({
          error: 'Workspace ID, name and base URL are required',
        });
      }

      // Verify workspace belongs to user
      const { data: workspace } = await supabaseAdmin
        .from('workspaces')
        .select('id')
        .eq('id', workspace_id)
        .eq('user_id', userId)
        .single();

      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }

      const { data, error } = await supabaseAdmin
        .from('environments')
        .insert({
          workspace_id,
          user_id: userId,
          name,
          base_url,
          variables: variables || {},
        })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.status(201).json({ environment: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all environments for workspace
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { workspaceId } = req.params;

      const { data, error } = await supabaseAdmin
        .from('environments')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ environments: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get single environment
  async getOne(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('environments')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) return res.status(404).json({ error: 'Environment not found' });

      return res.json({ environment: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update environment
  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { name, base_url, variables } = req.body;

      const { data, error } = await supabaseAdmin
        .from('environments')
        .update({
          name,
          base_url,
          variables,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ environment: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Set active environment
  async setActive(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { workspace_id } = req.body;

      if (!workspace_id) {
        return res.status(400).json({ error: 'Workspace ID is required' });
      }

      // Deactivate all environments in workspace
      await supabaseAdmin
        .from('environments')
        .update({ is_active: false })
        .eq('workspace_id', workspace_id)
        .eq('user_id', userId);

      // Activate selected environment
      const { data, error } = await supabaseAdmin
        .from('environments')
        .update({ is_active: true })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ environment: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete environment
  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('environments')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ message: 'Environment deleted successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Duplicate environment
  async duplicate(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const { data: existing } = await supabaseAdmin
        .from('environments')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!existing) {
        return res.status(404).json({ error: 'Environment not found' });
      }

      const { data, error } = await supabaseAdmin
        .from('environments')
        .insert({
          workspace_id: existing.workspace_id,
          user_id: userId,
          name: `${existing.name} (copy)`,
          base_url: existing.base_url,
          variables: existing.variables,
          is_active: false,
        })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.status(201).json({ environment: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};