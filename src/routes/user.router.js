import expres from 'express';
import {getUsers , getUserByID, getUserByFilter, createUser, deleteUser, updateUser} from '../controller/user.controller.js'
const { Router } = expres;
const router = new Router();



router.get("/", getUsers)
router.get("/filter/", getUserByFilter)
router.get("/:id", getUserByID)
router.post("/",createUser)
router.delete("/:id",deleteUser)
router.put("/:id",updateUser)
export default router