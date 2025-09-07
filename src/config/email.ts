import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: any[];
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn('Email configuration missing. Email features will be disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      logger.warn('Email service not configured. Skipping email send.');
      return;
    }

    try {
      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || 'HRMS'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to: ${options.to}`);
    } catch (error) {
      logger.error('Email sending failed:', error);
      // Don't throw error to prevent API failures due to email issues
    }
  }

  async sendWelcomeEmail(email: string, name: string, tempPassword?: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to ${process.env.COMPANY_NAME || 'Our Company'}!</h2>
        <p>Dear ${name},</p>
        <p>Welcome to our HRMS system. Your account has been created successfully.</p>
        ${tempPassword ? `
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Your temporary login credentials:</strong></p>
            <p>Email: ${email}</p>
            <p>Password: ${tempPassword}</p>
            <p style="color: #e74c3c;"><strong>Please change your password after first login.</strong></p>
          </div>
        ` : ''}
        <p>You can access the system at: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">${process.env.FRONTEND_URL || 'http://localhost:3000'}</a></p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: `Welcome to ${process.env.COMPANY_NAME || 'Our Company'} HRMS`,
      html
    });
  }

  async sendEmailVerification(email: string, name: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p>Dear ${name},</p>
        <p>Thank you for registering with our HRMS system. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email Address',
      html
    });
  }

  async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Dear ${name},</p>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html
    });
  }

  async sendLeaveNotification(
    email: string,
    employeeName: string,
    leaveDetails: any,
    type: 'applied' | 'approved' | 'rejected'
  ): Promise<void> {
    let subject = '';
    let html = '';

    const baseHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Leave Application ${type.charAt(0).toUpperCase() + type.slice(1)}</h2>
        <p>Dear ${employeeName},</p>
    `;

    const leaveInfo = `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Leave Details:</strong></p>
          <p>Type: ${leaveDetails.leaveType}</p>
          <p>From: ${new Date(leaveDetails.startDate).toLocaleDateString()}</p>
          <p>To: ${new Date(leaveDetails.endDate).toLocaleDateString()}</p>
          <p>Duration: ${leaveDetails.totalDays} day(s)</p>
          <p>Reason: ${leaveDetails.reason}</p>
        </div>
    `;

    switch (type) {
      case 'applied':
        subject = 'Leave Application Submitted';
        html = baseHtml + `
          <p>Your leave application has been submitted successfully and is pending approval.</p>
          ${leaveInfo}
          <p>You will be notified once your manager reviews the application.</p>
        `;
        break;

      case 'approved':
        subject = 'Leave Application Approved';
        html = baseHtml + `
          <p style="color: #28a745;">Your leave application has been approved!</p>
          ${leaveInfo}
          <p>Please ensure proper handover of your responsibilities before going on leave.</p>
        `;
        break;

      case 'rejected':
        subject = 'Leave Application Rejected';
        html = baseHtml + `
          <p style="color: #dc3545;">Your leave application has been rejected.</p>
          ${leaveInfo}
          ${leaveDetails.rejectionReason ? `<p><strong>Reason:</strong> ${leaveDetails.rejectionReason}</p>` : ''}
          <p>Please contact your manager for more details.</p>
        `;
        break;
    }

    html += `
        <p>Best regards,<br>HR Team</p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  async sendPayrollNotification(email: string, employeeName: string, payrollDetails: any): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payroll Processed</h2>
        <p>Dear ${employeeName},</p>
        <p>Your salary for ${payrollDetails.payPeriod.month}/${payrollDetails.payPeriod.year} has been processed.</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Payroll Summary:</strong></p>
          <p>Gross Salary: ₹${payrollDetails.grossSalary.toLocaleString()}</p>
          <p>Net Salary: ₹${payrollDetails.netSalary.toLocaleString()}</p>
          <p>Payment Date: ${payrollDetails.paymentDate ? new Date(payrollDetails.paymentDate).toLocaleDateString() : 'Pending'}</p>
        </div>
        <p>You can download your payslip from the HRMS portal.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: `Payroll Processed - ${payrollDetails.payPeriod.month}/${payrollDetails.payPeriod.year}`,
      html
    });
  }
}

export const emailService = new EmailService();