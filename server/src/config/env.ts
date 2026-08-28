import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/sur_o_jhankaar',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'sur_o_jhankaar_jwt_super_secret_key_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'sur_o_jhankaar_jwt_refresh_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  adminDefaultEmail: process.env.ADMIN_DEFAULT_EMAIL || 'admin@surojhankaar.in',
  adminDefaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || 'AdminSur@2026',
  pythonEngineUrl: process.env.PYTHON_ENGINE_URL || 'http://localhost:8000',
  pythonEngineApiKey: process.env.PYTHON_ENGINE_API_KEY || 'sur_o_jhankaar_internal_api_key_secure_2026'
};
