import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';
import { emailService } from '../services/email.service';

export const authController = {

  async signUp(req: Request, res: Response) {
    try {
      const { email, password, full_name } = req.body;

      if (!email || !password || !full_name) {
        return res.status(400).json({ error: 'Email, password and full name are required' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name } },
      });

      if (error) return res.status(400).json({ error: error.message });

      if (data.user) {
        await supabaseAdmin.from('profiles').insert({
          id: data.user.id,
          email,
          full_name,
        });

        try {
          await emailService.sendWelcome(email, full_name);
          await emailService.sendAdminNewUser(env.adminEmail, {
            email,
            name: full_name,
            plan: 'free',
          });
        } catch (emailErr) {
          console.error('Email send failed:', emailErr);
        }
      }

      return res.status(201).json({
        message: 'Account created. Please verify your email.',
        user: data.user,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async signIn(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return res.status(401).json({ error: error.message });

      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return res.json({
        message: 'Signed in successfully',
        user: profile,
        session: data.session,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async signOut(req: Request, res: Response) {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ message: 'Signed out successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) return res.status(404).json({ error: 'User not found' });

      return res.json({ user: profile });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async githubAuth(req: Request, res: Response) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${env.frontendUrl}/auth/callback`,
        },
      });

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ url: data.url });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async authCallback(req: Request, res: Response) {
    try {
      const { code } = req.query;

      if (!code) return res.status(400).json({ error: 'No code provided' });

      const { data, error } = await supabase.auth.exchangeCodeForSession(
        code as string
      );

      if (error) return res.status(400).json({ error: error.message });

      if (data.user) {
        await supabaseAdmin.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
          avatar_url: data.user.user_metadata?.avatar_url,
          github_username: data.user.user_metadata?.user_name,
        }, { onConflict: 'id' });
      }

      return res.redirect(
        `${env.frontendUrl}/dashboard?session=${data.session?.access_token}`
      );
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${env.frontendUrl}/auth/reset-password`,
      });

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ message: 'Password reset email sent' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { password } = req.body;
      if (!password) return res.status(400).json({ error: 'Password is required' });

      const { error } = await supabase.auth.updateUser({ password });
      if (error) return res.status(400).json({ error: error.message });

      return res.json({ message: 'Password updated successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async joinWaitlist(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      const { error } = await supabaseAdmin
        .from('waitlist')
        .insert({ email });

      if (error) {
        if (error.code === '23505') {
          return res.status(400).json({ error: 'Email already on waitlist' });
        }
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ message: 'Successfully joined waitlist' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};