import express from 'express';
import * as SourceController from '../controllers/source.controller';

const router = express.Router();

router.post('/list', SourceController.listSources);

export default router;
