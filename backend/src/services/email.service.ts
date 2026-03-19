import { Resend } from 'resend';
import { env } from '../config/env';

const resend = new Resend(env.resend.apiKey);

const FROM = env.resend.fromEmail || 'noreply@axon.dev';
const BRAND_COLOR = '#4f8aff';

function baseTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#02020a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#02020a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#08080f;border:1px solid #1a1a2e;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px;border-bottom:1px solid #1a1a2e;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display:inline-flex;align-items:center;gap:8px;">
                      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${BRAND_COLOR};box-shadow:0 0 12px ${BRAND_COLOR};"></span>
                      <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Axon</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #1a1a2e;">
              <p style="margin:0;font-size:12px;color:#3a3a5c;text-align:center;">
                © 2026 Axon. Built for developers who move fast.<br>
                <a href="#" style="color:#4f8aff;text-decoration:none;">Unsubscribe</a> · 
                <a href="#" style="color:#4f8aff;text-decoration:none;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function button(text: string, url: string): string {
  return `
<a href="${url}" style="display:inline-block;padding:14px 28px;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;margin:24px 0;">
  ${text}
</a>
  `;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-1px;">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#8888aa;">${text}</p>`;
}

export const emailService = {

  async sendWelcome(email: string, name: string) {
    const content = `
      ${heading(`Welcome to Axon, ${name.split(' ')[0]} 👋`)}
      ${paragraph('You\'re now part of the next generation of API testing. Axon lives inside your VS Code and automatically finds every API route in your project.')}
      ${paragraph('Here\'s what to do next:')}
      <ol style="margin:0 0 24px;padding-left:20px;color:#8888aa;font-size:15px;line-height:2;">
        <li>Install the Axon VS Code extension</li>
        <li>Open your project — routes are detected automatically</li>
        <li>Test your first API in one click</li>
      </ol>
      ${button('Go to Dashboard', `${env.frontendUrl}/dashboard`)}
      ${paragraph('If you have any questions, just reply to this email. We read every message.')}
    `;
    return resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Welcome to Axon 🚀',
      html: baseTemplate(content, 'Welcome to Axon'),
    });
  },

  async sendEmailVerification(email: string, name: string, verifyUrl: string) {
    const content = `
      ${heading('Verify your email')}
      ${paragraph(`Hi ${name.split(' ')[0]}, please verify your email address to activate your Axon account.`)}
      ${button('Verify Email', verifyUrl)}
      ${paragraph('This link expires in 24 hours. If you did not create an Axon account, you can safely ignore this email.')}
    `;
    return resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Verify your Axon email',
      html: baseTemplate(content, 'Verify Email'),
    });
  },

  async sendPasswordReset(email: string, resetUrl: string) {
    const content = `
      ${heading('Reset your password')}
      ${paragraph('We received a request to reset your Axon password. Click the button below to choose a new one.')}
      ${button('Reset Password', resetUrl)}
      ${paragraph('This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.')}
    `;
    return resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Reset your Axon password',
      html: baseTemplate(content, 'Reset Password'),
    });
  },

  async sendTeamInvite(email: string, inviterName: string, teamName: string, inviteUrl: string) {
    const content = `
      ${heading(`You've been invited to ${teamName}`)}
      ${paragraph(`${inviterName} has invited you to join their team on Axon — the AI-powered API testing tool that lives inside VS Code.`)}
      ${button('Accept Invite', inviteUrl)}
      ${paragraph('If you do not have an Axon account yet, you will be prompted to create one. This invite expires in 7 days.')}
    `;
    return resend.emails.send({
      from: FROM,
      to: email,
      subject: `${inviterName} invited you to ${teamName} on Axon`,
      html: baseTemplate(content, 'Team Invite'),
    });
  },

  async sendPaymentSuccess(email: string, name: string, plan: string, amount: number) {
    const content = `
      ${heading('Payment confirmed ✓')}
      ${paragraph(`Hi ${name.split(' ')[0]}, your payment of $${amount} for Axon ${plan} has been confirmed.`)}
      <table style="width:100%;background:#0d0d1a;border:1px solid #1a1a2e;border-radius:8px;padding:20px;margin:24px 0;">
        <tr>
          <td style="color:#8888aa;font-size:14px;padding:8px 0;">Plan</td>
          <td style="color:#ffffff;font-size:14px;font-weight:600;text-align:right;padding:8px 0;">${plan}</td>
        </tr>
        <tr>
          <td style="color:#8888aa;font-size:14px;padding:8px 0;">Amount</td>
          <td style="color:#ffffff;font-size:14px;font-weight:600;text-align:right;padding:8px 0;">$${amount}/month</td>
        </tr>
      </table>
      ${button('Go to Dashboard', `${env.frontendUrl}/dashboard`)}
    `;
    return resend.emails.send({
      from: FROM,
      to: email,
      subject: `Payment confirmed — Axon ${plan}`,
      html: baseTemplate(content, 'Payment Confirmed'),
    });
  },

  async sendPaymentFailed(email: string, name: string, updateUrl: string) {
    const content = `
      ${heading('Payment failed')}
      ${paragraph(`Hi ${name.split(' ')[0]}, we were unable to process your payment for Axon. Your account will be downgraded to the free plan if payment is not resolved within 3 days.`)}
      ${button('Update Payment Method', updateUrl)}
      ${paragraph('If you need help, just reply to this email.')}
    `;
    return resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Action required — Axon payment failed',
      html: baseTemplate(content, 'Payment Failed'),
    });
  },

  async sendAILimitWarning(email: string, name: string, used: number, limit: number) {
    const content = `
      ${heading('You\'re approaching your AI limit')}
      ${paragraph(`Hi ${name.split(' ')[0]}, you have used ${used} of your ${limit} AI debugging requests this month.`)}
      ${paragraph('Upgrade to Pro for unlimited AI requests and never hit a limit again.')}
      ${button('Upgrade to Pro', `${env.frontendUrl}/pricing`)}
    `;
    return resend.emails.send({
      from: FROM,
      to: email,
      subject: 'You\'re running low on AI requests',
      html: baseTemplate(content, 'AI Limit Warning'),
    });
  },

  async sendWeeklySummary(email: string, name: string, stats: {
    totalRequests: number;
    successRate: number;
    failedRequests: number;
    aiDebugCount: number;
  }) {
    const content = `
      ${heading('Your weekly Axon summary')}
      ${paragraph(`Here\'s what happened in your workspace this week, ${name.split(' ')[0]}:`)}
      <table style="width:100%;margin:24px 0;">
        ${[
          { label: 'Total requests', value: stats.totalRequests },
          { label: 'Success rate', value: `${stats.successRate}%` },
          { label: 'Failed requests', value: stats.failedRequests },
          { label: 'AI diagnoses', value: stats.aiDebugCount },
        ].map(s => `
          <tr>
            <td style="padding:12px 16px;background:#0d0d1a;border:1px solid #1a1a2e;color:#8888aa;font-size:14px;">${s.label}</td>
            <td style="padding:12px 16px;background:#0d0d1a;border:1px solid #1a1a2e;color:#ffffff;font-size:14px;font-weight:700;text-align:right;">${s.value}</td>
          </tr>
        `).join('')}
      </table>
      ${button('View Full Report', `${env.frontendUrl}/dashboard`)}
    `;
    return resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Your Axon weekly summary',
      html: baseTemplate(content, 'Weekly Summary'),
    });
  },

  async sendAdminNewUser(adminEmail: string, newUser: { email: string; name: string; plan: string }) {
    const content = `
      ${heading('New user signed up')}
      ${paragraph(`A new user just joined Axon:`)}
      <table style="width:100%;background:#0d0d1a;border:1px solid #1a1a2e;border-radius:8px;padding:20px;margin:24px 0;">
        <tr>
          <td style="color:#8888aa;font-size:14px;padding:8px 0;">Name</td>
          <td style="color:#ffffff;font-size:14px;font-weight:600;text-align:right;padding:8px 0;">${newUser.name}</td>
        </tr>
        <tr>
          <td style="color:#8888aa;font-size:14px;padding:8px 0;">Email</td>
          <td style="color:#ffffff;font-size:14px;font-weight:600;text-align:right;padding:8px 0;">${newUser.email}</td>
        </tr>
        <tr>
          <td style="color:#8888aa;font-size:14px;padding:8px 0;">Plan</td>
          <td style="color:#ffffff;font-size:14px;font-weight:600;text-align:right;padding:8px 0;">${newUser.plan}</td>
        </tr>
      </table>
      ${button('View in Admin', `${env.frontendUrl}/admin`)}
    `;
    return resend.emails.send({
      from: FROM,
      to: adminEmail,
      subject: `New Axon user: ${newUser.name}`,
      html: baseTemplate(content, 'New User'),
    });
  },
  async sendAnnouncement(email: string, name: string, title: string, message: string) {
    const content = `
      ${heading(title)}
      ${paragraph(`Hi ${name.split(' ')[0]},`)}
      ${paragraph(message)}
      ${button('Go to Dashboard', `${env.frontendUrl}/dashboard`)}
    `;
    return resend.emails.send({
      from: FROM,
      to: email,
      subject: title,
      html: baseTemplate(content, title),
    });
  },
};