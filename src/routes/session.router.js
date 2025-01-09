import express from 'express'
import { currentUser, disconnectUser, loginUser } from '../controller/session.controller.js';
import { authToken } from '../utils/middlewares.js';
const { Router } = express;
const router = new Router();

router.get("/current", authToken, currentUser);
router.get("/disconnect", authToken, disconnectUser);
router.post("/login", loginUser);

export default router;