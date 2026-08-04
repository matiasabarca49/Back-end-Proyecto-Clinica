import express from 'express';
import {Router} from 'express';
import { health, live, ready } from './health.controller.js';
import { authRoles, authToken } from '../../middlewares/auth.middlewares.js';

const router = Router();

router.get('/', authToken, authRoles("admin"), health);
router.get('/live', live);
router.get('/ready', ready);

export default router;