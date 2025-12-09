const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeElasticemail();
  }

  initializeElasticemail() {
    try {
      if (!process.env.ELASTICEMAIL_API_KEY || !process.env.ELASTICEMAIL_FROM_EMAIL) {
        console.warn('⚠️  Email service not configured.');
        console.warn('⚠️  Required: ELASTICEMAIL_API_KEY and ELASTICEMAIL_FROM_EMAIL');
        console.warn('⚠️  Get your API key from: https://elasticemail.com');
        this.transporter = null;
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: 'smtp.elasticemail.com',
        port: 2525,
        secure: false,
        auth: {
          user: process.env.ELASTICEMAIL_FROM_EMAIL,
          pass: process.env.ELASTICEMAIL_API_KEY,
        },
      });

      console.log('✅ Elasticemail service initialized successfully');
      console.log(`📧 Emails will be sent from: ${process.env.ELASTICEMAIL_FROM_EMAIL}`);
    } catch (error) {
      console.error('❌ Failed to initialize Elasticemail:', error.message);
      this.transporter = null;
    }
  }

  async sendPasswordResetEmail(email, resetToken, userName) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not configured. Please set ELASTICEMAIL_API_KEY and ELASTICEMAIL_FROM_EMAIL');
      }

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      
      const mailOptions = {
        from: `"SpeakWise" <${process.env.ELASTICEMAIL_FROM_EMAIL}>`,
        to: email,
        subject: 'Password Reset Request - SpeakWise',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                  <p>Hi ${userName},</p>
                  <p>We received a request to reset your password for your SpeakWise account.</p>
                  <p>Click the button below to reset your password:</p>
                  <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                  </div>
                  <p>Or copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                  <div class="warning">
                    <strong>Important:</strong>
                    <ul>
                      <li>This link will expire in <strong>1 hour</strong></li>
                      <li>If you didn't request this, please ignore this email</li>
                      <li>Your password won't change until you create a new one</li>
                    </ul>
                  </div>
                  <p>Best regards,<br>The SpeakWise Team</p>
                </div>
                <div class="footer">
                  <p>This is an automated email. Please do not reply.</p>
                  <p>&copy; ${new Date().getFullYear()} SpeakWise. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `
Hi ${userName},

We received a request to reset your password for your SpeakWise account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
The SpeakWise Team
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully to:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async verifyConnection() {
    try {
      if (!this.transporter) return false;
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
