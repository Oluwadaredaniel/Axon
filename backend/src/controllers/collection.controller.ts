import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export const collectionController = {

  // Create collection
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { name, workspace_id } = req.body;

      if (!name || !workspace_id) {
        return res.status(400).json({ error: 'Name and workspace ID are required' });
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
        .from('collections')
        .insert({ name, workspace_id, user_id: userId })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.status(201).json({ collection: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all collections for workspace
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { workspaceId } = req.params;

      const { data, error } = await supabaseAdmin
        .from('collections')
        .select(`
          *,
          collection_routes(
            api_routes(id, method, path, description)
          )
        `)
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ collections: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get single collection
  async getOne(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('collections')
        .select(`
          *,
          collection_routes(
            api_routes(*)
          )
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) return res.status(404).json({ error: 'Collection not found' });

      return res.json({ collection: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Add route to collection
  async addRoute(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { route_id } = req.body;

      if (!route_id) {
        return res.status(400).json({ error: 'Route ID is required' });
      }

      // Verify collection belongs to user
      const { data: collection } = await supabaseAdmin
        .from('collections')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      const { error } = await supabaseAdmin
        .from('collection_routes')
        .insert({ collection_id: id, route_id });

      if (error) {
        if (error.code === '23505') {
          return res.status(400).json({ error: 'Route already in collection' });
        }
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ message: 'Route added to collection' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Remove route from collection
  async removeRoute(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id, routeId } = req.params;

      // Verify collection belongs to user
      const { data: collection } = await supabaseAdmin
        .from('collections')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      const { error } = await supabaseAdmin
        .from('collection_routes')
        .delete()
        .eq('collection_id', id)
        .eq('route_id', routeId);

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ message: 'Route removed from collection' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update collection
  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { name } = req.body;

      if (!name) return res.status(400).json({ error: 'Name is required' });

      const { data, error } = await supabaseAdmin
        .from('collections')
        .update({ name })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ collection: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete collection
  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('collections')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ message: 'Collection deleted successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};