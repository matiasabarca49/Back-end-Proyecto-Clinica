import express from 'express';
import { failLogin } from '../controller/failure.controller.js';
const { Router } = express;
const router = new Router();

router.get('/login', failLogin);

export default router;

