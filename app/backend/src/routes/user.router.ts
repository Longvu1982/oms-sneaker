import express from 'express';
import * as UserController from '../controllers/user.controller';
import { protectAuth, protectRoles } from '../middleware/auth-middleware';
import { Role } from '@prisma/client';

const router = express.Router();

router.post('/list', protectAuth, UserController.listUsers);
router.post('/list-detail', protectAuth, UserController.listUsersDetail);

router.post('/create', protectAuth, protectRoles([Role.ADMIN]), UserController.createUser);
router.post('/create/bulk', protectAuth, protectRoles([Role.ADMIN]), UserController.bulkCreateUser);

router.post('/:id/update', protectAuth, protectRoles([Role.ADMIN]), UserController.updateUser);

router.get('/:userId', protectAuth, UserController.getUserByID);

router.post('/delete/bulk', protectAuth, protectRoles([Role.ADMIN]), UserController.bulkDeleteUser);
router.post('/delete', protectAuth, protectRoles([Role.ADMIN]), UserController.deleteUser);

export default router;
