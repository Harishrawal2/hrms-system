import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { User, Role } from '@prisma/client';
import { UserDAO } from '../dao/user.dao';
import { CustomRoleDAO } from '../dao/customRole.dao';
import { AuditLogDAO } from '../dao/auditLog.dao';
import { NotificationDAO } from '../dao/notification.dao';
import { redisClient } from '../config/redis';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { emailService } from '../config/email';

export interface RegisterData {
  email: string;
  password: string;
  role?: Role;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private userDAO: UserDAO;
  private customRoleDAO: CustomRoleDAO;
  private auditLogDAO: AuditLogDAO;
  private notificationDAO: NotificationDAO;

  constructor() {
    this.userDAO = new UserDAO();
    this.customRoleDAO = new CustomRoleDAO();
    this.auditLogDAO = new AuditLogDAO();
    this.notificationDAO = new NotificationDAO();
  }

  private generateTokens(userId: string): TokenPair {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    return { accessToken, refreshToken };
  }

  async register(data: RegisterData): Promise<{ user: Partial<User>; tokens: TokenPair }> {
    const existingUser = await this.userDAO.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(400, 'User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(data.password, parseInt(process.env.BCRYPT_ROUNDS || '12'));

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await this.userDAO.create({
      ...data,
      password: hashedPassword,
      emailVerificationToken,
      emailVerificationExpires,
      emailVerified: false
    });

    const tokens = this.generateTokens(user.id);
    await this.userDAO.addRefreshToken(user.id, tokens.refreshToken);

    // Store session in Redis
    await redisClient.setEx(`session:${user.id}`, 3600 * 24 * 7, JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role
    }));

    // Send verification email
    try {
      await emailService.sendEmailVerification(user.email, user.email, emailVerificationToken);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
    }

    logger.info(`User registered: ${data.email} with role: ${data.role || 'EMPLOYEE'}`);

    // Create audit log
    await this.auditLogDAO.create({
      userId: user.id,
      action: 'USER_REGISTERED',
      resource: 'User',
      resourceId: user.id,
      newData: { email: user.email, role: user.role }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified
      },
      tokens
    };
  }

  async login(data: LoginData): Promise<{ user: Partial<User>; tokens: TokenPair }> {
    const user = await this.userDAO.findByEmail(data.email);
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new ApiError(401, 'Please verify your email before logging in');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const tokens = this.generateTokens(user.id);

    await Promise.all([
      this.userDAO.addRefreshToken(user.id, tokens.refreshToken),
      this.userDAO.update(user.id, { lastLogin: new Date() }),
      redisClient.setEx(`session:${user.id}`, 3600 * 24 * 7, JSON.stringify({
        userId: user.id,
        email: user.email,
        role: user.role
      }))
    ]);

    logger.info(`User logged in: ${data.email}`);

    // Create audit log
    await this.auditLogDAO.create({
      userId: user.id,
      action: 'USER_LOGIN',
      resource: 'User',
      resourceId: user.id
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: new Date()
      },
      tokens
    };
  }

  async setup2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
    const user = await this.userDAO.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `HRMS (${user.email})`,
      issuer: process.env.COMPANY_NAME || 'HRMS'
    });

    await this.userDAO.update(userId, {
      twoFactorSecret: secret.base32
    });

    const qrCode = await qrcode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode
    };
  }

  async verify2FA(userId: string, token: string): Promise<void> {
    const user = await this.userDAO.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new ApiError(400, '2FA not setup');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      throw new ApiError(400, 'Invalid 2FA token');
    }

    await this.userDAO.update(userId, {
      twoFactorEnabled: true
    });

    logger.info(`2FA enabled for user: ${userId}`);
  }

  async logoutAll(userId: string): Promise<void> {
    await Promise.all([
      this.userDAO.clearRefreshTokens(userId),
      redisClient.del(`session:${userId}`)
    ]);

    // Create audit log
    await this.auditLogDAO.create({
      userId,
      action: 'LOGOUT_ALL_SESSIONS',
      resource: 'User',
      resourceId: userId
    });

    logger.info(`All sessions logged out for user: ${userId}`);
  }

  async getSessions(userId: string): Promise<any[]> {
    // In a real implementation, you'd track sessions in database
    // For now, return mock data
    return [
      {
        id: '1',
        device: 'Chrome on Windows',
        ipAddress: '192.168.1.1',
        lastUsed: new Date(),
        isActive: true
      }
    ];
  }
  async logout(userId: string, token: string): Promise<void> {
    await Promise.all([
      redisClient.setEx(`blacklist:${token}`, 3600 * 24 * 7, 'blacklisted'),
      redisClient.del(`session:${userId}`)
    ]);

    // Create audit log
    await this.auditLogDAO.create({
      userId,
      action: 'USER_LOGOUT',
      resource: 'User',
      resourceId: userId
    });

    logger.info(`User logged out: ${userId}`);
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { userId: string; type: string };

    if (decoded.type !== 'refresh') {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const user = await this.userDAO.findById(decoded.userId);
    if (!user || !user.isActive || !user.refreshTokens.includes(refreshToken)) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const tokens = this.generateTokens(user.id);

    await Promise.all([
      this.userDAO.removeRefreshToken(user.id, refreshToken),
      this.userDAO.addRefreshToken(user.id, tokens.refreshToken)
    ]);

    return tokens;
  }

  async getProfile(userId: string): Promise<User | null> {
    return this.userDAO.findById(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userDAO.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new ApiError(400, 'Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || '12'));

    await Promise.all([
      this.userDAO.update(userId, { password: hashedPassword }),
      this.userDAO.clearRefreshTokens(userId),
      redisClient.del(`session:${userId}`)
    ]);

    logger.info(`Password changed for user: ${userId}`);

    // Create audit log
    await this.auditLogDAO.create({
      userId,
      action: 'PASSWORD_CHANGED',
      resource: 'User',
      resourceId: userId
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userDAO.findByEmailVerificationToken(token);
    if (!user) {
      throw new ApiError(400, 'Invalid or expired verification token');
    }

    await this.userDAO.update(user.id, {
      emailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined
    });

    logger.info(`Email verified for user: ${user.email}`);

    // Create audit log
    await this.auditLogDAO.create({
      userId: user.id,
      action: 'EMAIL_VERIFIED',
      resource: 'User',
      resourceId: user.id
    });
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userDAO.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.emailVerified) {
      throw new ApiError(400, 'Email is already verified');
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.userDAO.update(user.id, {
      emailVerificationToken,
      emailVerificationExpires
    });

    await emailService.sendEmailVerification(user.email, user.email, emailVerificationToken);
    logger.info(`Verification email resent to: ${user.email}`);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userDAO.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userDAO.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires
    });

    await emailService.sendPasswordResetEmail(user.email, user.email, resetToken);
    logger.info(`Password reset email sent to: ${user.email}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userDAO.findByPasswordResetToken(token);
    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || '12'));

    await Promise.all([
      this.userDAO.update(user.id, {
        password: hashedPassword,
        passwordResetToken: undefined,
        passwordResetExpires: undefined
      }),
      this.userDAO.clearRefreshTokens(user.id),
      redisClient.del(`session:${user.id}`)
    ]);

    logger.info(`Password reset successful for user: ${user.email}`);

    // Create audit log
    await this.auditLogDAO.create({
      userId: user.id,
      action: 'PASSWORD_RESET',
      resource: 'User',
      resourceId: user.id
    });
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      // Check if token is blacklisted
      const isBlacklisted = await redisClient.get(`blacklist:${token}`);
      if (isBlacklisted) {
        throw new ApiError(401, 'Token has been revoked');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      return this.userDAO.findById(decoded.userId);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError(401, 'Invalid token');
      }
      throw error;
    }
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.userDAO.findById(userId);
    if (!user) return false;

    // Admin has all permissions
    if (user.role === 'ADMIN') return true;

    // Check custom role permissions
    if (user.customRoleId) {
      const customRole = await this.customRoleDAO.findById(user.customRoleId);
      if (customRole && customRole.permissions.includes(permission)) {
        return true;
      }
    }

    // Default role permissions
    const defaultPermissions = this.getDefaultPermissions(user.role);
    return defaultPermissions.includes(permission);
  }

  private getDefaultPermissions(role: Role): string[] {
    const permissions: Record<Role, string[]> = {
      ADMIN: ['*'], // All permissions
      HR: [
        'employee.create', 'employee.read', 'employee.update',
        'leave.approve', 'payroll.process', 'recruitment.manage'
      ],
      MANAGER: [
        'employee.read', 'leave.approve', 'attendance.view',
        'performance.manage'
      ],
      EMPLOYEE: [
        'profile.read', 'profile.update', 'leave.apply',
        'attendance.self', 'payroll.view'
      ]
    };

    return permissions[role] || [];
  }
}