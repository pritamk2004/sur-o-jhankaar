import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/searchService';

export class SearchController {
  public static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query = '', language, limit = '20' } = req.query as Record<string, string>;

      const results = await SearchService.searchAll(query, {
        language,
        limit: parseInt(limit, 10)
      });

      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }
}
