import express from 'express';
import {Router} from 'express';
import { health, instance, live, ready } from './health.controller.js';
import { authRoles, authToken } from '../../middlewares/auth.middlewares.js';

const router = Router();

router.get('/', authToken, authRoles("admin"), health);
router.get('/live', live);
router.get('/ready', ready);
router.get("/instance", authToken, authRoles("admin"), instance);

export default router;