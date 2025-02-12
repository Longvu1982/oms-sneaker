import express from 'express';
import * as SourceController from '../controllers/source.controller';
import { protectAuth } from '../middleware/auth-middleware';

const router = express.Router();

router.post('/list', SourceController.listSources);

router.post('/create', protectAuth, SourceController.createSource);

router.post('/:id/update', protectAuth, SourceController.updateSource);

export default router;
