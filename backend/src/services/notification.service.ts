import { supabaseAdmin } from '../config/supabase';
import { emailService } from './email.service';

export const notificationService = {

  // Create in-app notification
  async create(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error' | 'success' = 'info'
  ) {
    try {
      await supabaseAdmin.from('notifications').insert({
        user_id: userId,
        title,
        message,
        type,
      });
    } catch (err) {
      console.error('Failed to create notification:', err);
    }
  },

  // Get notifications for user
  async getForUser(userId: string, unreadOnly = false) {
    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (unreadOnly) query = query.eq('read', false);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Mark as read
  async markRead(userId: string, notificationId?: string) {
    let query = supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);

    if (notificationId) query = query.eq('id', notificationId);

    await query;
  },

  // Check AI usage and notify if approaching limit
  async checkAIUsageAndNotify(userId: string) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('ai_requests_used, ai_requests_limit, plan, email, full_name')
      .eq('id', userId)
      .single();

    if (!profile) return;

    const percentage = Math.round(
      (profile.ai_requests_used / profile.ai_requests_limit) * 100
    );

    // 80% warning
    if (percentage >= 80 && percentage < 100) {
      await notificationService.create(
        userId,
        'Approaching AI limit',
        `You have used ${profile.ai_requests_used} of ${profile.ai_requests_limit} AI requests this month. Upgrade to get more.`,
        'warning'
      );

      // Send email warning once
      if (percentage === 80) {
        await emailService.sendAILimitWarning(
          profile.email,
          profile.full_name,
          profile.ai_requests_used,
          profile.ai_requests_limit
        );
      }
    }

    // 100% — hit limit
    if (percentage >= 100) {
      await notificationService.create(
        userId,
        'AI limit reached',
        `You have used all ${profile.ai_requests_limit} AI requests for this month. Upgrade to Pro for more requests.`,
        'error'
      );
    }
  },

  // Reset AI usage for all users monthly
  async resetMonthlyAIUsage() {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ ai_requests_used: 0 });

    if (error) {
      console.error('Failed to reset AI usage:', error);
      return false;
    }

    console.log('Monthly AI usage reset successfully');
    return true;
  },

  // Send announcement to all users
  async sendAnnouncement(title: string, message: string, type: string) {
    // Save to announcements table
    await supabaseAdmin.from('announcements').insert({
      title,
      message,
      type,
    });

    // Get all users
    const { data: users } = await supabaseAdmin
      .from('profiles')
      .select('id');

    if (!users) return;

    // Create notification for each user
    const notifications = users.map((u) => ({
      user_id: u.id,
      title,
      message,
      type: 'info',
    }));

    // Insert in batches of 100
    for (let i = 0; i < notifications.length; i += 100) {
      await supabaseAdmin
        .from('notifications')
        .insert(notifications.slice(i, i + 100));
    }
  },

  // Upgrade prompt notifications
  async sendUpgradePrompt(userId: string, reason: string) {
    const messages: Record<string, { title: string; message: string }> = {
      ai_limit: {
        title: 'Unlock unlimited AI debugging',
        message: 'Upgrade to Pro for 1,000 AI requests/month and never get blocked again.',
      },
      workspace_limit: {
        title: 'Need more workspaces?',
        message: 'Upgrade to Pro to create up to 3 workspaces for all your projects.',
      },
      history_limit: {
        title: 'Access your full history',
        message: 'Upgrade to Pro for unlimited request history. Never lose a request again.',
      },
      team_feature: {
        title: 'Collaborate with your team',
        message: 'Upgrade to Team plan to invite members and share collections.',
      },
    };

    const prompt = messages[reason] || messages.ai_limit;

    await notificationService.create(
      userId,
      prompt.title,
      prompt.message,
      'warning'
    );
  },
};