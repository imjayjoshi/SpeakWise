const nodemailer = require('nodemailer');

/**
 * Email service for sending password reset emails
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Check if email credentials are configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('⚠️  Email service not configured. EMAIL_USER and EMAIL_PASSWORD environment variables are required.');
        console.warn('⚠️  Password reset emails will not be sent until email is configured.');
        this.transporter = null;
        return;
      }

      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      console.log('✅ Email service initialized successfully');
      console.log(`📧 Email will be sent from: ${process.env.EMAIL_USER}`);
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      this.transporter = null;
    }
  }

  /**
   * Send password reset email
   * @param {string} email - Recipient email
   * @param {string} resetToken - Password reset token
   * @param {string} userName - User's full name
   */
  async sendPasswordResetEmail(email, resetToken, userName) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.');
      }

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      
      const mailOptions = {
        from: `"SpeakWise" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request - SpeakWise',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 30px;
                  text-align: center;
                  border-radius: 10px 10px 0 0;
                }
                .content {
                  background: #f9f9f9;
                  padding: 30px;
                  border-radius: 0 0 10px 10px;
                }
                .button {
                  display: inline-block;
                  padding: 12px 30px;
                  background: #667eea;
                  color: white;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 20px 0;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  color: #666;
                  font-size: 12px;
                }
                .warning {
                  background: #fff3cd;
                  border-left: 4px solid #ffc107;
                  padding: 10px;
                  margin: 20px 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 Password Reset Request</h1>
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
                    <strong>⚠️ Important:</strong>
                    <ul>
                      <li>This link will expire in <strong>1 hour</strong></li>
                      <li>If you didn't request this, please ignore this email</li>
                      <li>Your password won't change until you create a new one</li>
                    </ul>
                  </div>
                  
                  <p>If you have any questions, please contact our support team.</p>
                  
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

If you didn't request this, please ignore this email. Your password won't change until you create a new one.

Best regards,
The SpeakWise Team
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Verify email service is working
   */
  async verifyConnection() {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }
      await this.transporter.verify();
      console.log('Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
