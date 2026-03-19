import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export const historyController = {

  // Get request history for a workspace
  async getWorkspaceHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { workspaceId } = req.params;
      const { page = 1, limit = 20, method, status } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      // Verify workspace belongs to user
      const { data: workspace } = await supabaseAdmin
        .from('workspaces')
        .select('id')
        .eq('id', workspaceId)
        .eq('user_id', userId)
        .single();

      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }

      let query = supabaseAdmin
        .from('request_history')
        .select('*, api_routes(method, path)', { count: 'exact' })
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .range(offset, offset + Number(limit) - 1);

      if (method) query = query.eq('method', method);
      if (status) query = query.eq('status_code', Number(status));

      const { data, error, count } = await query;

      if (error) return res.status(400).json({ error: error.message });

      return res.json({
        history: data,
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil((count || 0) / Number(limit)),
      });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get single request details
  async getOne(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('request_history')
        .select('*, api_routes(method, path, file_path, line_number)')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) return res.status(404).json({ error: 'Request not found' });

      return res.json({ request: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Save a new request
  async save(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const {
        workspace_id,
        route_id,
        method,
        url,
        headers,
        body,
        status_code,
        response,
        duration_ms,
      } = req.body;

      if (!workspace_id || !method || !url) {
        return res.status(400).json({
          error: 'Workspace ID, method and URL are required',
        });
      }

      // Check history limit based on plan
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('plan')
        .eq('id', userId)
        .single();

      const { data: plan } = await supabaseAdmin
        .from('plans')
        .select('history_days')
        .eq('id', profile?.plan || 'free')
        .single();

      // Delete old history beyond plan limit
      if (plan?.history_days && plan.history_days < 999999) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - plan.history_days);

        await supabaseAdmin
          .from('request_history')
          .delete()
          .eq('user_id', userId)
          .lt('created_at', cutoffDate.toISOString());
      }

      const { data, error } = await supabaseAdmin
        .from('request_history')
        .insert({
          workspace_id,
          route_id,
          user_id: userId,
          method,
          url,
          headers,
          body,
          status_code,
          response,
          duration_ms,
        })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.status(201).json({ request: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete a request
  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('request_history')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ message: 'Request deleted successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Clear all history for a workspace
  async clearWorkspaceHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { workspaceId } = req.params;

      const { error } = await supabaseAdmin
        .from('request_history')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId);

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ message: 'History cleared successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get history stats for a workspace
  async getStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { workspaceId } = req.params;

      const { data, error } = await supabaseAdmin
        .from('request_history')
        .select('status_code, method, duration_ms')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId);

      if (error) return res.status(400).json({ error: error.message });

      const total = data.length;
      const successful = data.filter((r) => r.status_code < 400).length;
      const failed = data.filter((r) => r.status_code >= 400).length;
      const avgDuration =
        data.reduce((sum, r) => sum + (r.duration_ms || 0), 0) / total || 0;

      const methodBreakdown: Record<string, number> = {};
      data.forEach((r) => {
        methodBreakdown[r.method] = (methodBreakdown[r.method] || 0) + 1;
      });

      return res.json({
        total,
        successful,
        failed,
        successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
        avgDuration: Math.round(avgDuration),
        methodBreakdown,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};