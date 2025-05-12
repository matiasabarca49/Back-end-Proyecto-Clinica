import express from 'express';
import { currentUser, disconnectUser, loginUser } from '../controller/session.controller.js';
import { authToken, verificarJWT } from '../utils/middlewares.js';

const { Router } = express;
const router = new Router();

router.get("/current", authToken, currentUser);
router.get("/disconnect", authToken, disconnectUser);
router.post("/login", loginUser);

// Nueva ruta para obtener perfil con token (modo Authorization Bearer)
router.get("/profile", verificarJWT, (req, res) => {
    res.status(200).json({
        status: "success",
        user: req.user
    });
});

export default router;
