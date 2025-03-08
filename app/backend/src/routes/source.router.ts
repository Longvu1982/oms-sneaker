import express from 'express';
import * as SourceController from '../controllers/source.controller';
import { protectAuth, protectRoles } from '../middleware/auth-middleware';
import { Role } from '@prisma/client';

const router = express.Router();

router.post('/list', protectAuth, protectRoles([Role.ADMIN]), SourceController.listSources);

router.post('/create', protectAuth, protectRoles([Role.ADMIN]), SourceController.createSource);

router.post('/:id/update', protectAuth, protectRoles([Role.ADMIN]), SourceController.updateSource);

export default router;
