import express from 'express';
import * as UserController from '../controllers/user.controller';
import { protectAuth } from '../middleware/auth-middleware';

const router = express.Router();

router.post('/list', protectAuth, UserController.listUsers);

router.post('/list-detail', protectAuth, UserController.listUsersDetail);

router.post('/create', protectAuth, UserController.createUser);

router.post('/:id/update', protectAuth, UserController.updateUser);

router.post('/create/bulk', protectAuth, UserController.bulkCreateUser);

router.get('/:userId', protectAuth, UserController.getUserByID);

export default router;
