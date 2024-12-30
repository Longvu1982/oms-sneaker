import express from 'express';
import * as UserController from '../controllers/user.controller';

const router = express.Router();

router.post('/list', UserController.listUsers);

export default router;
