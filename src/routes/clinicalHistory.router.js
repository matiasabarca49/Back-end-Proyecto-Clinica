import expres from 'express';
const { Router } = expres;
const router = new Router();

router.get("/", (req, res) =>{
    res.status(200).send("Hola soy el endpoint de Historias Clinica");
})



export default router