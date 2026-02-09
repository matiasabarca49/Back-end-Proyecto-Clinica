import express from 'express';
import { currentUser, disconnectUser, loginUser,verify2FA,loginUser2fa, changePassword } from '../controller/session.controller.js';
import { forgotPassword,resetPassword } from '../controller/password.controller.js';
import { authToken} from '../middlewares/middlewares.js';

const { Router } = express;
const router = new Router();

router.get("/current", authToken, currentUser);
router.get("/disconnect", authToken, disconnectUser);
router.post("/login", loginUser);
router.post("/login-2fa", loginUser2fa);
router.post("/verify-2fa", verify2FA);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.patch("/change-password", authToken, changePassword)
export default router;
