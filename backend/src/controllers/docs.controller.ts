import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export const docsController = {

  // Generate OpenAPI spec from workspace routes
  async generate(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { workspace_id, title, description, version } = req.body;

      if (!workspace_id) {
        return res.status(400).json({ error: 'Workspace ID is required' });
      }

      // Verify workspace belongs to user
      const { data: workspace } = await supabaseAdmin
        .from('workspaces')
        .select('*')
        .eq('id', workspace_id)
        .eq('user_id', userId)
        .single();

      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }

      // Get all routes for workspace
      const { data: routes } = await supabaseAdmin
        .from('api_routes')
        .select('*')
        .eq('workspace_id', workspace_id)
        .order('path', { ascending: true });

      if (!routes || routes.length === 0) {
        return res.status(400).json({
          error: 'No routes found in workspace. Scan your project first.',
        });
      }

      // Build OpenAPI spec
      const paths: Record<string, any> = {};

      routes.forEach((route) => {
        const path = route.path.replace(/:([a-zA-Z]+)/g, '{$1}');

        if (!paths[path]) paths[path] = {};

        const method = route.method.toLowerCase();

        paths[path][method] = {
          summary: route.description || `${route.method} ${route.path}`,
          description: route.description || '',
          tags: [path.split('/')[1] || 'default'],
          parameters: extractPathParams(route.path),
          requestBody: ['post', 'put', 'patch'].includes(method)
            ? {
                required: true,
                content: {
                  'application/json': {
                    schema: { type: 'object' },
                  },
                },
              }
            : undefined,
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { type: 'object' },
                },
              },
            },
            '400': { description: 'Bad request' },
            '401': { description: 'Unauthorized' },
            '404': { description: 'Not found' },
            '500': { description: 'Internal server error' },
          },
        };
      });

      const openApiSpec = {
        openapi: '3.0.0',
        info: {
          title: title || workspace.name,
          description: description || `API documentation for ${workspace.name}`,
          version: version || '1.0.0',
        },
        paths,
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      };

      // Generate public slug
      const slug = `${workspace.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      // Save or update docs
      const { data: existing } = await supabaseAdmin
        .from('api_docs')
        .select('id')
        .eq('workspace_id', workspace_id)
        .eq('user_id', userId)
        .single();

      let doc;
      if (existing) {
        const { data } = await supabaseAdmin
          .from('api_docs')
          .update({
            title: title || workspace.name,
            description,
            version: version || '1.0.0',
            openapi_spec: openApiSpec,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();
        doc = data;
      } else {
        const { data } = await supabaseAdmin
          .from('api_docs')
          .insert({
            workspace_id,
            user_id: userId,
            title: title || workspace.name,
            description,
            version: version || '1.0.0',
            openapi_spec: openApiSpec,
            public_slug: slug,
          })
          .select()
          .single();
        doc = data;
      }

      return res.json({
        doc,
        routeCount: routes.length,
        message: 'Documentation generated successfully',
      });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get docs for workspace
  async getForWorkspace(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { workspaceId } = req.params;

      const { data, error } = await supabaseAdmin
        .from('api_docs')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .single();

      if (error) return res.status(404).json({ error: 'Documentation not found' });

      return res.json({ doc: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get public docs by slug — no auth required
  async getPublic(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const { data, error } = await supabaseAdmin
        .from('api_docs')
        .select('*')
        .eq('public_slug', slug)
        .eq('is_public', true)
        .single();

      if (error) return res.status(404).json({ error: 'Documentation not found' });

      return res.json({ doc: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Toggle public/private
  async togglePublic(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const { data: existing } = await supabaseAdmin
        .from('api_docs')
        .select('is_public')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!existing) {
        return res.status(404).json({ error: 'Documentation not found' });
      }

      const { data, error } = await supabaseAdmin
        .from('api_docs')
        .update({ is_public: !existing.is_public })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.json({
        doc: data,
        message: data.is_public
          ? 'Documentation is now public'
          : 'Documentation is now private',
      });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Export as JSON
  async exportJSON(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('api_docs')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) return res.status(404).json({ error: 'Documentation not found' });

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${data.title}-openapi.json"`
      );

      return res.send(JSON.stringify(data.openapi_spec, null, 2));
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};

// Helper to extract path parameters
function extractPathParams(path: string) {
  const params: any[] = [];
  const matches = path.match(/:([a-zA-Z]+)/g);

  if (matches) {
    matches.forEach((match) => {
      params.push({
        name: match.replace(':', ''),
        in: 'path',
        required: true,
        schema: { type: 'string' },
      });
    });
  }

  return params;
}