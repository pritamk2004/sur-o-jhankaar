import { Request, Response, NextFunction } from 'express';
import { CsvImportService } from '../services/csvImportService';
import { UrlImportService } from '../services/urlImportService';
import { ImportJobModel } from '../models/ImportJob';
import { ProviderManager } from '../providers';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs';

export class ImportController {
  public static async previewCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError('No CSV file uploaded', 400, 'FILE_MISSING');
      }

      const preview = await CsvImportService.generatePreview(req.file.path, req.file.originalname);
      res.status(200).json({
        success: true,
        data: {
          preview,
          tempFilePath: req.file.path
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async startCsvImport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tempFilePath } = req.body;
      let targetPath = tempFilePath;

      if (!targetPath && req.file) {
        targetPath = req.file.path;
      }

      if (!targetPath || !fs.existsSync(targetPath)) {
        throw new AppError('Import file not found. Please upload again.', 400, 'FILE_NOT_FOUND');
      }

      const job = await ImportJobModel.create({
        type: 'csv',
        status: 'QUEUED',
        total: 0,
        processed: 0,
        imported: 0,
        existing: 0,
        skipped: 0,
        failed: 0,
        errors: []
      });

      setImmediate(() => {
        CsvImportService.executeImport(targetPath, job._id.toString()).catch(err => {
          console.error('[CSV Import Error]:', err);
        });
      });

      res.status(202).json({
        success: true,
        message: 'CSV import job queued successfully',
        data: {
          jobId: job._id.toString(),
          status: 'QUEUED'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async fetchUrlMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url } = req.body;
      if (!url) {
        throw new AppError('URL is required', 400, 'INVALID_URL');
      }

      const provider = ProviderManager.detectProviderFromUrl(url);
      const metadata = await provider.getMetadata(url);

      res.status(200).json({
        success: true,
        data: metadata
      });
    } catch (error) {
      next(error);
    }
  }

  public static async importSingleUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const song = await UrlImportService.importSingleSong(req.body);
      res.status(201).json({
        success: true,
        message: 'Song imported successfully',
        data: song
      });
    } catch (error) {
      next(error);
    }
  }

  public static async startPlaylistUrlImport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url } = req.body;
      if (!url) {
        throw new AppError('Playlist URL is required', 400, 'INVALID_URL');
      }

      const provider = ProviderManager.detectProviderFromUrl(url);
      const job = await ImportJobModel.create({
        type: 'playlist_url',
        sourceUrl: url,
        provider: provider.id,
        status: 'QUEUED',
        total: 0,
        processed: 0,
        imported: 0,
        existing: 0,
        skipped: 0,
        failed: 0,
        errors: []
      });

      setImmediate(() => {
        UrlImportService.executePlaylistImport(url, job._id.toString()).catch(err => {
          console.error('[Playlist Import Error]:', err);
        });
      });

      res.status(202).json({
        success: true,
        message: 'Playlist import job queued successfully',
        data: {
          jobId: job._id.toString(),
          status: 'QUEUED'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getJobStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await ImportJobModel.findById(req.params.id);
      if (!job) {
        throw new AppError('Import job not found', 404, 'NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: job
      });
    } catch (error) {
      next(error);
    }
  }

  public static async cancelJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await ImportJobModel.findById(req.params.id);
      if (!job) {
        throw new AppError('Import job not found', 404, 'NOT_FOUND');
      }

      job.status = 'CANCELLED';
      await job.save();

      res.status(200).json({
        success: true,
        message: 'Import job cancelled'
      });
    } catch (error) {
      next(error);
    }
  }
}
