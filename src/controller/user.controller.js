import UsersManager from "../DAO/mongo/users.mongo.js";
const usersManager = new UsersManager();

export const getUsers = async (req, res)=>{
    const usersGetted = await usersManager.getUsers();
    usersGetted
    ? res.status(200).send({status: "Succes", users : usersGetted})
    : res.status(404).send({status: "ERROR"})

}

export const getUserByID = async (req, res) =>{
    const userID = req.params.id;
    const userGetted = await usersManager.getUserById(userID);
    userGetted
    ? res.status(200).send({status: "Succes", users : userGetted})
    : res.status(404).send({status: "ERROR"})

}

export const getUserByFilter = async (req, res) =>{
    const filter = req.query;
    const userGetted = await usersManager.getUserByFilter(filter);
    userGetted
    ? res.status(200).send({status: "Succes", users : userGetted})
    : res.status(404).send({status: "ERROR"})

}

export const createUser = async (req, res) =>{
    const user = req.body;
    console.log(user)
    const userCreated = await usersManager.createUser(user);
    console.log(userCreated)
    userCreated
    ? res.status(201).send({status: "Succes", users : userCreated
        })
    : res.status(404).send({status: "ERROR"})
}
export const deleteUser = async (req, res) =>{
    const userID = req.params.id;
    const userDeleted = await usersManager.deleteUser(userID);
    userDeleted
    ? res.status(200).send({status: "Succes", users : userDeleted})
    : res.status(404).send({status: "ERROR"})

}
export const updateUser = async (req, res) =>{
    const userData = req.body;
    const idUser=req.params.id;
    console.log(userData)
    
    const userUpdated = await usersManager.updateUser(idUser,userData);
    console.log(userUpdated)
    userUpdated
    ? res.status(201).send({status: "Succes", users : userUpdated
        })
        : res.status(404).send({status: "ERROR"})
        
}
