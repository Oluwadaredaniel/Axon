import { notificationService } from './notification.service';
import { supabaseAdmin } from '../config/supabase';
import { emailService } from './email.service';

export const cronService = {

  // Reset AI usage for all users — runs on 1st of every month
  async resetMonthlyAIUsage() {
    console.log('[CRON] Resetting monthly AI usage...');
    const success = await notificationService.resetMonthlyAIUsage();
    if (success) {
      console.log('[CRON] Monthly AI usage reset complete');
    }
  },

  // Send weekly summary emails — runs every Monday
  async sendWeeklySummaries() {
    console.log('[CRON] Sending weekly summaries...');

    const { data: users } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name');

    if (!users) return;

    for (const user of users) {
      try {
        // Get stats for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: history } = await supabaseAdmin
          .from('request_history')
          .select('status_code, ai_diagnosis')
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString());

        if (!history || history.length === 0) continue;

        const total = history.length;
        const successful = history.filter((r) => r.status_code < 400).length;
        const failed = history.filter((r) => r.status_code >= 400).length;
        const aiDebugCount = history.filter((r) => r.ai_diagnosis).length;
        const successRate = Math.round((successful / total) * 100);

        await emailService.sendWeeklySummary(user.email, user.full_name, {
          totalRequests: total,
          successRate,
          failedRequests: failed,
          aiDebugCount,
        });
      } catch (err) {
        console.error(`[CRON] Failed to send summary to ${user.email}:`, err);
      }
    }

    console.log('[CRON] Weekly summaries sent');
  },

  // Check and notify users approaching AI limit — runs daily
  async checkAILimits() {
    console.log('[CRON] Checking AI usage limits...');

    const { data: users } = await supabaseAdmin
      .from('profiles')
      .select('id, ai_requests_used, ai_requests_limit, plan')
      .eq('plan', 'free');

    if (!users) return;

    for (const user of users) {
      const percentage = Math.round(
        (user.ai_requests_used / user.ai_requests_limit) * 100
      );

      if (percentage >= 80) {
        await notificationService.checkAIUsageAndNotify(user.id);
      }
    }

    console.log('[CRON] AI limit check complete');
  },

  // Clean up old error logs — runs weekly
  async cleanOldLogs() {
    console.log('[CRON] Cleaning old logs...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await supabaseAdmin
      .from('error_logs')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString())
      .eq('level', 'info');

    console.log('[CRON] Old logs cleaned');
  },

  // Start all cron jobs
  start() {
    console.log('[CRON] Starting cron jobs...');

    // Run immediately on start in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[CRON] Development mode — skipping scheduled jobs');
      return;
    }

    // Reset AI usage on 1st of every month at midnight
    scheduleJob('0 0 1 * *', cronService.resetMonthlyAIUsage);

    // Send weekly summaries every Monday at 9am
    scheduleJob('0 9 * * 1', cronService.sendWeeklySummaries);

    // Check AI limits every day at 8am
    scheduleJob('0 8 * * *', cronService.checkAILimits);

    // Clean old logs every Sunday at 2am
    scheduleJob('0 2 * * 0', cronService.cleanOldLogs);

    console.log('[CRON] All cron jobs scheduled');
  },
};

// Simple cron scheduler without external dependencies
function scheduleJob(cronExpression: string, job: () => void) {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = cronExpression.split(' ');

  setInterval(() => {
    const now = new Date();
    const matchesMinute = minute === '*' || parseInt(minute) === now.getMinutes();
    const matchesHour = hour === '*' || parseInt(hour) === now.getHours();
    const matchesDayOfMonth = dayOfMonth === '*' || parseInt(dayOfMonth) === now.getDate();
    const matchesMonth = month === '*' || parseInt(month) === now.getMonth() + 1;
    const matchesDayOfWeek = dayOfWeek === '*' || parseInt(dayOfWeek) === now.getDay();

    if (matchesMinute && matchesHour && matchesDayOfMonth && matchesMonth && matchesDayOfWeek) {
      job();
    }
  }, 60 * 1000); // Check every minute
}