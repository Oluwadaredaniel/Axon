import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export const teamController = {

  // Create a team
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { name, github_org } = req.body;

      if (!name) return res.status(400).json({ error: 'Team name is required' });

      // Check if user plan allows teams
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('plan')
        .eq('id', userId)
        .single();

      if (profile?.plan === 'free') {
        return res.status(403).json({
          error: 'Upgrade to Team plan to create teams',
          upgrade: true,
        });
      }

      // Generate slug from name
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const { data: team, error } = await supabaseAdmin
        .from('teams')
        .insert({ name, slug, owner_id: userId, github_org })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      // Add creator as admin member
      await supabaseAdmin.from('team_members').insert({
        team_id: team.id,
        user_id: userId,
        role: 'admin',
      });

      return res.status(201).json({ team });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all teams for user
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const { data, error } = await supabaseAdmin
        .from('team_members')
        .select(`
          role,
          joined_at,
          teams(*)
        `)
        .eq('user_id', userId);

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ teams: data });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get single team
  async getOne(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      // Check user is member
      const { data: member } = await supabaseAdmin
        .from('team_members')
        .select('role')
        .eq('team_id', id)
        .eq('user_id', userId)
        .single();

      if (!member) return res.status(403).json({ error: 'Not a team member' });

      const { data: team, error } = await supabaseAdmin
        .from('teams')
        .select(`
          *,
          team_members(
            role,
            joined_at,
            profiles(id, full_name, email, avatar_url)
          )
        `)
        .eq('id', id)
        .single();

      if (error) return res.status(404).json({ error: 'Team not found' });

      return res.json({ team, userRole: member.role });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Invite member
  async inviteMember(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { email, role } = req.body;

      if (!email) return res.status(400).json({ error: 'Email is required' });

      // Check inviter is admin
      const { data: inviter } = await supabaseAdmin
        .from('team_members')
        .select('role')
        .eq('team_id', id)
        .eq('user_id', userId)
        .single();

      if (!inviter || inviter.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can invite members' });
      }

      // Check team member limit based on plan
      const { data: team } = await supabaseAdmin
        .from('teams')
        .select('plan')
        .eq('id', id)
        .single();

      const { data: plan } = await supabaseAdmin
        .from('plans')
        .select('team_members_limit')
        .eq('id', team?.plan || 'free')
        .single();

      const { count } = await supabaseAdmin
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', id);

      if (count && plan && count >= plan.team_members_limit) {
        return res.status(403).json({
          error: `Team member limit reached for your plan`,
          upgrade: true,
        });
      }

      // Find user by email
      const { data: invitee } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (!invitee) {
        return res.status(404).json({
          error: 'No Axon account found with that email. They need to sign up first.',
        });
      }

      // Add member
      const { error } = await supabaseAdmin
        .from('team_members')
        .insert({
          team_id: id,
          user_id: invitee.id,
          role: role || 'viewer',
          invited_by: userId,
        });

      if (error) {
        if (error.code === '23505') {
          return res.status(400).json({ error: 'User is already a team member' });
        }
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ message: 'Member invited successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update member role
  async updateMemberRole(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id, memberId } = req.params;
      const { role } = req.body;

      if (!role) return res.status(400).json({ error: 'Role is required' });

      // Check requester is admin
      const { data: requester } = await supabaseAdmin
        .from('team_members')
        .select('role')
        .eq('team_id', id)
        .eq('user_id', userId)
        .single();

      if (!requester || requester.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can update roles' });
      }

      const { error } = await supabaseAdmin
        .from('team_members')
        .update({ role })
        .eq('team_id', id)
        .eq('user_id', memberId);

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ message: 'Role updated successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Remove member
  async removeMember(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id, memberId } = req.params;

      // Check requester is admin or removing themselves
      const { data: requester } = await supabaseAdmin
        .from('team_members')
        .select('role')
        .eq('team_id', id)
        .eq('user_id', userId)
        .single();

      if (!requester) {
        return res.status(403).json({ error: 'Not a team member' });
      }

      if (requester.role !== 'admin' && userId !== memberId) {
        return res.status(403).json({ error: 'Only admins can remove members' });
      }

      const { error } = await supabaseAdmin
        .from('team_members')
        .delete()
        .eq('team_id', id)
        .eq('user_id', memberId);

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ message: 'Member removed successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete team
  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      // Check requester is owner
      const { data: team } = await supabaseAdmin
        .from('teams')
        .select('owner_id')
        .eq('id', id)
        .single();

      if (!team) return res.status(404).json({ error: 'Team not found' });

      if (team.owner_id !== userId) {
        return res.status(403).json({ error: 'Only the team owner can delete the team' });
      }

      const { error } = await supabaseAdmin
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ message: 'Team deleted successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};