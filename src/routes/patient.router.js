import express from 'express';
const { Router } = express;
const router = new Router();

router.get("/", (req, res) =>{
    res.status(200).send("Hola soy el endpoint de Pacientes");
});

export default router;