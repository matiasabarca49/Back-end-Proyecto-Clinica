import express from 'express';
import passport from 'passport';
import { authGoogle } from '../../controller/passports/google.auth.controller.js';
//impo { verificarJWT } from '../utils/middlewares.js';

const router = express.Router();

router.get('/google',
passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
passport.authenticate('google', { session: false }),
authGoogle
);
/*
router.get('/profile', verificarJWT, getProfile);
*/
export default router;
