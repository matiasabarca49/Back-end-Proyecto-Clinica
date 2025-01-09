import expres from 'express';
import {getUsers , getUserByID, getUserByFilter, createUser, deleteUser, updateUser} from '../controller/user.controller.js'
import { authToken, checkAuth, checkPermissionsAdmin } from '../utils/middlewares.js';
const { Router } = expres;
const router = new Router();



router.get("/", authToken, getUsers)
router.get("/filter/", authToken,getUserByFilter)
router.get("/:id", authToken, getUserByID)
router.post("/", authToken, checkPermissionsAdmin, createUser)
router.delete("/:id", authToken, checkPermissionsAdmin, deleteUser)
router.put("/:id", authToken, checkPermissionsAdmin, updateUser)
export default router