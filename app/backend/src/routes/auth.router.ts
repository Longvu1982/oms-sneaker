import express from 'express';
import * as AuthController from '../controllers/auth.controller';
import { protectAuth } from '../middleware/auth-middleware';
const router = express.Router();

router.post('/login', AuthController.validateLoginData, AuthController.login);

router.post('/me', protectAuth, AuthController.authMe);

router.post('/logout', protectAuth, AuthController.logout);

export default router;
