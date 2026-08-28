import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AdminModel } from '../models/Admin';
import { config } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('Email and password are required', 400, 'INVALID_CREDENTIALS');
      }

      const admin = await AdminModel.findOne({ email: email.toLowerCase() });
      if (!admin || !admin.isActive) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      admin.lastLogin = new Date();
      await admin.save();

      const accessToken = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        config.jwtSecret,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { id: admin._id },
        config.jwtRefreshSecret,
        { expiresIn: '30d' }
      );

      res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: {
          user: {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: admin.role,
            isActive: admin.isActive,
            lastLogin: admin.lastLogin
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 15 * 60
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new AppError('Refresh token is required', 400, 'TOKEN_REQUIRED');
      }

      let payload: any;
      try {
        payload = jwt.verify(refreshToken, config.jwtRefreshSecret);
      } catch {
        throw new AppError('Invalid or expired refresh token', 401, 'INVALID_TOKEN');
      }

      const admin = await AdminModel.findById(payload.id);
      if (!admin || !admin.isActive) {
        throw new AppError('Admin not found or inactive', 401, 'UNAUTHORIZED');
      }

      const newAccessToken = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        config.jwtSecret,
        { expiresIn: '15m' }
      );

      res.status(200).json({
        success: true,
        data: {
          accessToken: newAccessToken,
          expiresIn: 15 * 60
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.adminUser) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const admin = await AdminModel.findById(req.adminUser.id);
      if (!admin) {
        throw new AppError('Admin not found', 404, 'NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive,
          lastLogin: admin.lastLogin
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
