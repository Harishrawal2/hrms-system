import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError } from '../utils/ApiError';

export class AuthController {
  // GET-compatible email verification for query param
  verifyEmailGet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.query.token;
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: 'Token is required' });
      }
      await this.authService.verifyEmail(token);
      sendResponse(res, 200, null, 'Email verified successfully');
    } catch (error) {
      next(error);
    }
  };
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      sendResponse(res, 201, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      sendResponse(res, 200, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.token && req.user) {
        await this.authService.logout(req.user.id, req.token);
      }
      sendResponse(res, 200, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokens = await this.authService.refreshToken(req.body.refreshToken);
      sendResponse(res, 200, tokens, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const profile = await this.authService.getProfile(req.user!.id);
      sendResponse(res, 200, profile, 'Profile fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      await this.authService.changePassword(req.user!.id, currentPassword, newPassword);
      sendResponse(res, 200, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;
      await this.authService.verifyEmail(token);
      sendResponse(res, 200, null, 'Email verified successfully');
    } catch (error) {
      next(error);
    }
  };

  resendVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      await this.authService.resendVerificationEmail(email);
      sendResponse(res, 200, null, 'Verification email sent successfully');
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      await this.authService.forgotPassword(email);
      sendResponse(res, 200, null, 'Password reset email sent if account exists');
    } catch (error) {
      next(error);
    }
  };

  setup2FA = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.setup2FA(req.user!.id);
      sendResponse(res, 200, result, '2FA setup initiated');
    } catch (error) {
      next(error);
    }
  };

  verify2FA = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;
      await this.authService.verify2FA(req.user!.id, token);
      sendResponse(res, 200, null, '2FA enabled successfully');
    } catch (error) {
      next(error);
    }
  };

  logoutAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.authService.logoutAll(req.user!.id);
      sendResponse(res, 200, null, 'Logged out from all sessions');
    } catch (error) {
      next(error);
    }
  };

  getSessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const sessions = await this.authService.getSessions(req.user!.id);
      sendResponse(res, 200, sessions, 'Sessions fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;
      await this.authService.resetPassword(token, newPassword);
      sendResponse(res, 200, null, 'Password reset successfully');
    } catch (error) {
      next(error);
    }
  };
}