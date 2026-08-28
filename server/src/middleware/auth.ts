import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from './errorHandler';
import { AdminModel } from '../models/Admin';

export interface AuthenticatedRequest extends Request {
  adminUser?: {
    id: string;
    email: string;
    role: 'ADMIN';
  };
}

export async function requireAdminAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Admin authentication required', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Invalid bearer token', 401, 'UNAUTHORIZED');
    }

    let payload: any;
    try {
      payload = jwt.verify(token, config.jwtSecret);
    } catch (jwtErr) {
      throw new AppError('Token has expired or is invalid', 401, 'TOKEN_EXPIRED');
    }

    const admin = await AdminModel.findById(payload.id);
    if (!admin || !admin.isActive) {
      throw new AppError('Admin account not found or deactivated', 403, 'FORBIDDEN');
    }

    req.adminUser = {
      id: admin._id.toString(),
      email: admin.email,
      role: 'ADMIN'
    };

    next();
  } catch (error) {
    next(error);
  }
}
