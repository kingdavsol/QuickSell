import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { analyzePhoto, uploadPhoto, deletePhoto } from '../controllers/photoController';

const router = Router();

/**
 * @route   POST /api/v1/photos/upload
 * @desc    Upload and process photos
 * @access  Private
 */
router.post('/upload', authenticate, uploadPhoto);

/**
 * @route   POST /api/v1/photos/analyze
 * @desc    Analyze photo with AI (OpenAI Vision)
 * @access  Private
 */
router.post('/analyze', authenticate, analyzePhoto);

/**
 * @route   DELETE /api/v1/photos/:id
 * @desc    Delete a photo
 * @access  Private
 */
router.delete('/:id', authenticate, deletePhoto);

export default router;
