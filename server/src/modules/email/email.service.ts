import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null = null;
  private readonly fromEmail: string;
  private readonly clientUrl: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.fromEmail =
      this.config.get<string>('RESEND_FROM_EMAIL') ?? 'noreply@niyukti.com';
    this.clientUrl =
      this.config.get<string>('CLIENT_URL') ?? 'http://localhost:3000';

    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn(
        'RESEND_API_KEY not set — emails will be logged only (dev mode)',
      );
    }
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${this.clientUrl}/reset-password?token=${token}`;

    if (!this.resend) {
      this.logger.debug(
        `[DEV] Password reset link for ${email}: ${resetUrl}`,
      );
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Reset your Niyukti Admin password',
        html: this.buildResetEmailHtml(resetUrl),
      });
      this.logger.log(`Password reset email sent to: ${email}`);
    } catch (err) {
      // Non-fatal — log and continue; caller already returned 200 to prevent enumeration
      this.logger.error(`Failed to send reset email to ${email}: ${String(err)}`);
    }
  }

  private buildResetEmailHtml(resetUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <!-- Header -->
        <tr><td style="background:#0f172a;padding:32px 40px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Niyukti Admin</p>
          <p style="margin:6px 0 0;font-size:13px;color:#94a3b8;">Temporary Event Staffing</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#0f172a;">Reset your password</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6;">
            We received a request to reset the password for your Niyukti admin account.
            Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
          </p>
          <table cellpadding="0" cellspacing="0"><tr><td>
            <a href="${resetUrl}"
               style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 28px;border-radius:10px;">
              Reset Password
            </a>
          </td></tr></table>
          <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.6;">
            If you didn't request a password reset, you can safely ignore this email — your password won't change.<br/>
            If the button above doesn't work, copy and paste this link into your browser:<br/>
            <a href="${resetUrl}" style="color:#6366f1;word-break:break-all;">${resetUrl}</a>
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
          <p style="margin:0;font-size:12px;color:#cbd5e1;">&copy; ${new Date().getFullYear()} Niyukti. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }
}
