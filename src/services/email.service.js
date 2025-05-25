const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;
const handlebars = require('handlebars');
const { EMAIL_CONFIG } = require('../config/environment');

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = new Map();
    this.initializeTransporter();
  }

  // Initialize email transporter
  initializeTransporter() {
    this.transporter = nodemailer.createTransporter({
      host: EMAIL_CONFIG.HOST,
      port: EMAIL_CONFIG.PORT,
      secure: EMAIL_CONFIG.SECURE,
      auth: {
        user: EMAIL_CONFIG.USER,
        pass: EMAIL_CONFIG.PASS
      }
    });
  }

  // Load email template
  async loadTemplate(templateName) {
    if (this.templates.has(templateName)) {
      return this.templates.get(templateName);
    }

    try {
      const templatePath = path.join(
        process.cwd(),
        'src',
        'templates',
        'email',
        `${templateName}.hbs`
      );
      
      const templateContent = await fs.readFile(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateContent);
      
      this.templates.set(templateName, compiledTemplate);
      return compiledTemplate;
    } catch (error) {
      throw new Error(`Template ${templateName} not found`);
    }
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    const template = await this.loadTemplate('welcome');
    const html = template({
      name: user.name,
      email: user.email,
      loginUrl: `${process.env.FRONTEND_URL}/login`
    });

    const mailOptions = {
      from: EMAIL_CONFIG.FROM,
      to: user.email,
      subject: 'Welcome to WorkFlowPulse!',
      html
    };

    return await this.sendEmail(mailOptions);
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const template = await this.loadTemplate('password-reset');
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = template({
      name: user.name,
      resetUrl,
      expiryTime: '1 hour'
    });

    const mailOptions = {
      from: EMAIL_CONFIG.FROM,
      to: user.email,
      subject: 'Password Reset Request',
      html
    };

    return await this.sendEmail(mailOptions);
  }

  // Send project completion notification
  async sendProjectCompletionEmail(user, project) {
    const template = await this.loadTemplate('project-completion');
    const html = template({
      name: user.name,
      projectName: project.name,
      completionDate: project.updatedAt.toLocaleDateString(),
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`
    });

    const mailOptions = {
      from: EMAIL_CONFIG.FROM,
      to: user.email,
      subject: `Project "${project.name}" Completed!`,
      html
    };

    return await this.sendEmail(mailOptions);
  }

  // Send weekly summary email
  async sendWeeklySummaryEmail(user, summaryData) {
    const template = await this.loadTemplate('weekly-summary');
    const html = template({
      name: user.name,
      weekStart: summaryData.weekStart,
      weekEnd: summaryData.weekEnd,
      totalHours: summaryData.totalHours,
      totalEarnings: summaryData.totalEarnings,
      projectsWorked: summaryData.projectsWorked,
      topProject: summaryData.topProject,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`
    });

    const mailOptions = {
      from: EMAIL_CONFIG.FROM,
      to: user.email,
      subject: 'Your Weekly WorkFlowPulse Summary',
      html
    };

    return await this.sendEmail(mailOptions);
  }

  // Send email verification
  async sendEmailVerification(user, verificationToken) {
    const template = await this.loadTemplate('email-verification');
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const html = template({
      name: user.name,
      verificationUrl
    });

    const mailOptions = {
      from: EMAIL_CONFIG.FROM,
      to: user.email,
      subject: 'Verify Your Email Address',
      html
    };

    return await this.sendEmail(mailOptions);
  }

  // Send generic email
  async sendEmail(mailOptions) {
    try {
      const info = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Verify email configuration
  async verifyConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service is ready' };
    } catch (error) {
      throw new Error(`Email service configuration error: ${error.message}`);
    }
  }
}

module.exports = new EmailService();