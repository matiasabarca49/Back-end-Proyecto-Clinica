import expres from 'express';
import {getUsers , getUserByID, createUser, deleteUser, updateUser, searchUsers} from '../controller/user.controller.js'
import { authToken, checkAuth, checkPermissionsAdmin } from '../middlewares/middlewares.js';
import { validateUpdateUser, validateUserData } from '../validation/user.validation.js';
const { Router } = expres;
const router = new Router();



router.get("/", authToken, getUsers)
router.get("/filter/", authToken, searchUsers)
router.get("/:id", authToken, getUserByID)
/* router.get("/many/filter/", authToken,getManyUsersByFilter) */
//=
router.post("/", authToken, checkPermissionsAdmin, validateUserData,createUser)
//=
router.delete("/:id", authToken, checkPermissionsAdmin, deleteUser)
//=
router.put("/:id", authToken, checkPermissionsAdmin, validateUpdateUser, updateUser)

export default router