import express from 'express';
import * as UserController from '../controllers/user.controller';
import { protectAuth } from '../middleware/auth-middleware';

const router = express.Router();

router.post('/list', protectAuth, UserController.listUsers);
router.post('/list-detail', protectAuth, UserController.listUsersDetail);

router.post('/create', protectAuth, UserController.createUser);
router.post('/create/bulk', protectAuth, UserController.bulkCreateUser);

router.post('/:id/update', protectAuth, UserController.updateUser);

router.get('/:userId', protectAuth, UserController.getUserByID);

router.post('/delete/bulk', protectAuth, UserController.bulkDeleteUser);
router.post('/delete', protectAuth, UserController.deleteUser);

export default router;
