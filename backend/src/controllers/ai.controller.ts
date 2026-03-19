import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { debugAPI, explainRoute } from '../services/ai.service';

export const aiController = {

  // Debug a failed API request
  async debug(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const {
        method,
        url,
        statusCode,
        errorMessage,
        requestBody,
        responseBody,
        codeContext,
        filePath,
        lineNumber,
        routeId,
        workspaceId,
      } = req.body;

      if (!method || !url || !statusCode) {
        return res.status(400).json({
          error: 'Method, URL and status code are required',
        });
      }

      // Check AI usage limit
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('ai_requests_used, ai_requests_limit, plan')
        .eq('id', userId)
        .single();

      if (!profile) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (
        profile.plan === 'free' &&
        profile.ai_requests_used >= profile.ai_requests_limit
      ) {
        return res.status(429).json({
          error: 'AI request limit reached. Upgrade to Pro for unlimited requests.',
          upgrade: true,
        });
      }

      // Call AI service
      const result = await debugAPI({
        method,
        url,
        statusCode,
        errorMessage,
        requestBody,
        responseBody,
        codeContext,
        filePath,
        lineNumber,
      });

      // Increment usage counter
      await supabaseAdmin
        .from('profiles')
        .update({ ai_requests_used: profile.ai_requests_used + 1 })
        .eq('id', userId);

      // Save to request history if routeId provided
      if (routeId && workspaceId) {
        await supabaseAdmin.from('request_history').insert({
          route_id: routeId,
          workspace_id: workspaceId,
          user_id: userId,
          method,
          url,
          body: requestBody,
          status_code: statusCode,
          response: responseBody,
          ai_diagnosis: result.diagnosis,
          ai_fix: result.fix,
        });
      }

      return res.json({ result });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Explain what an API route does
  async explain(req: Request, res: Response) {
    try {
      const { method, path, codeContext } = req.body;

      if (!method || !path || !codeContext) {
        return res.status(400).json({
          error: 'Method, path and code context are required',
        });
      }

      const explanation = await explainRoute(method, path, codeContext);

      return res.json({ explanation });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get AI usage stats for current user
  async getUsage(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('ai_requests_used, ai_requests_limit, plan')
        .eq('id', userId)
        .single();

      if (!profile) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        used: profile.ai_requests_used,
        limit: profile.ai_requests_limit,
        plan: profile.plan,
        remaining: profile.ai_requests_limit - profile.ai_requests_used,
        percentage: Math.round(
          (profile.ai_requests_used / profile.ai_requests_limit) * 100
        ),
      });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};