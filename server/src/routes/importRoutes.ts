import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import { ImportController } from '../controllers/importController';
import { requireAdminAuth } from '../middleware/auth';

const upload = multer({
  dest: path.join(os.tmpdir(), 'sur_o_jhankaar_uploads'),
  limits: { fileSize: 50 * 1024 * 1024 }
});

const router = Router();

router.use(requireAdminAuth);

router.post('/csv/preview', upload.single('file'), ImportController.previewCsv);
router.post('/csv/start', upload.single('file'), ImportController.startCsvImport);
router.post('/url/fetch', ImportController.fetchUrlMetadata);
router.post('/url/song', ImportController.importSingleUrl);
router.post('/url/playlist', ImportController.startPlaylistUrlImport);
router.get('/jobs/:id', ImportController.getJobStatus);
router.post('/jobs/:id/cancel', ImportController.cancelJob);

export default router;
