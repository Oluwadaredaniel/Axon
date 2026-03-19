import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export const searchController = {

  // Global search across routes, history and collections
  async search(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { q, type } = req.query;

      if (!q || String(q).trim().length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
      }

      const query = String(q).trim();
      const results: Record<string, any[]> = {};

      // Search API routes
      if (!type || type === 'routes') {
        const { data: routes } = await supabaseAdmin
          .from('api_routes')
          .select(`
            id, method, path, description, file_path,
            workspaces(id, name, user_id)
          `)
          .or(`path.ilike.%${query}%,description.ilike.%${query}%`)
          .eq('workspaces.user_id', userId)
          .limit(10);

        results.routes = routes?.filter(
          (r: any) => r.workspaces?.user_id === userId
        ) || [];
      }

      // Search request history
      if (!type || type === 'history') {
        const { data: history } = await supabaseAdmin
          .from('request_history')
          .select('id, method, url, status_code, created_at')
          .eq('user_id', userId)
          .or(`url.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(10);

        results.history = history || [];
      }

      // Search collections
      if (!type || type === 'collections') {
        const { data: collections } = await supabaseAdmin
          .from('collections')
          .select('id, name, workspace_id, created_at')
          .eq('user_id', userId)
          .ilike('name', `%${query}%`)
          .limit(10);

        results.collections = collections || [];
      }

      // Search workspaces
      if (!type || type === 'workspaces') {
        const { data: workspaces } = await supabaseAdmin
          .from('workspaces')
          .select('id, name, framework, github_repo, created_at')
          .eq('user_id', userId)
          .ilike('name', `%${query}%`)
          .limit(10);

        results.workspaces = workspaces || [];
      }

      const totalResults = Object.values(results).reduce(
        (sum, arr) => sum + arr.length, 0
      );

      return res.json({
        query,
        totalResults,
        results,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};