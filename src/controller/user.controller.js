import UsersManager from "../DAO/mongo/users.mongo.js";
const usersManager = new UsersManager();


/**
 * Endpoint que retorna todos los usuarios de la DB
 * Respuesta: 
 *        200: retorna un Json con estado y array usuarios
 *        500: Error. Problema al obtener la coleccion de la DB
*/
export const getUsers = async (req, res)=>{
    //Obtenemos los usuarios utilizando el método especifico del Controlador Lógico de Usuarios
    const usersGetted = await usersManager.getUsers();
    usersGetted
    ? res.status(200).send({status: "Succes", users : usersGetted})
    : res.status(500).send({status: "ERROR"})

}


/**
 * Endpoint que retorna un Documento de la Colección usuario mediante su ID
 * Param: ID de Usuario
 * Respuesta: 
 *        200: retorna un Json con estado y Objeto Usuario
 *        404: Error. ID Incorrecto o no existe en la DB
*/
export const getUserByID = async (req, res) =>{
    const userID = req.params.id;
    const userGetted = await usersManager.getUserById(userID);
    userGetted
    ? res.status(200).send({status: "Succes", users : userGetted})
    : res.status(404).send({status: "ERROR"})

}


/**
 * Endpoint que retorna un Documento de la Colección usuario filtrado mediante un atributo
 * Query: { clave : Valor }
 * Respuesta: 
 *        200: retorna un Json con estado y Objeto Usuario
 *        400: Error. El atributo no existe en el modelo o solicitud mal hecha
*/
export const getUserByFilter = async (req, res) =>{
    const filter = req.query;
    const userGetted = await usersManager.getUserByFilter(filter);
    userGetted
    ? res.status(200).send({status: "Succes", users : userGetted})
    : res.status(400).send({status: "ERROR"})

}

/**
 * Endpoint que retorna la coleccion utilizando paginate
 * Query: { search, query : rol, sort, limit }
 * Respuesta: 
 *        200: retorna un Json con estado y Objeto Usuario
 *        500: Error. El atributo no existe en el modelo o solicitud mal hecha
*/
export const getsUsersPaginate = async (req, res) =>{
    let defaultQuery, defaultLimit, defaultPage, defaultSort;
    //Descomposición del objeto query
    const {search, query, sort, page , limit} = req.query;
        //console.log(req.query)
    //Verificamos las query que vienen en la solicitud
    limit && (defaultLimit = parseInt(limit));
    page && (defaultPage = parseInt(page));
    //Si la query sort se encuentra en la solicitud, el value remplaza el valor por defecto(Undefined).
    sort && (defaultSort = {lastName: parseInt(sort)});
    //Si la longitud de busqueda es CERO, el usuario no realizó una busqueda.
    search.length !== 0
     ?  defaultQuery = {lastName: search}
     : query !== "0" && (defaultQuery = {rol : query});
    //Se pason las query o los valores por defecto al Controlador Logico
    const usersGetted = await usersManager.getUserPaginate(defaultQuery, defaultLimit, defaultPage, defaultSort)
        //console.log(usersGetted)
    usersGetted
        ? res.status(200).send({status: "Success", users: usersGetted})
        : res.status(500).send({status: "ERROR"})
}


/**
 * Endpoint que crea un documento del tipo User en la colección Users
 * Body: Objeto User
 * Respuesta: 
 *        200: retorna un Json con estado y Objeto Usuario
 *        500: Error. El atributo no existe en el modelo o solicitud mal hecha
*/
export const createUser = async (req, res) =>{
    const user = req.body;
    const userCreated = await usersManager.createUser(user);
    // console.log(userCreated)
    userCreated
    ? res.status(201).send({status: "Succes", users : userCreated
        })
    : res.status(500).send({status: "ERROR"})
}

/**
 * Endpoint que elimina un elemento de la coleccion con su ID
 * Params: ID Usuario
 * Respuesta: 
 *        200: retorna un Json con estado y Objeto Usuario
 *        404: Error. El ID no existe en el modelo o solicitud mal hecha
*/
export const deleteUser = async (req, res) =>{
    const userID = req.params.id;
    const userDeleted = await usersManager.deleteUser(userID);
    userDeleted
    ? res.status(200).send({status: "Succes", users : userDeleted})
    : res.status(404).send({status: "ERROR"})

}

/**
 * Endpoint que elimina un elemento de la coleccion con su ID
 * Params: ID Usuario
 * Query: Datos a actualizar -> {Clave : Valor}
 * Respuesta: 
 *        200: retorna un Json con estado y Objeto Usuario
 *        404: Error. El ID no existe en el modelo o solicitud mal hecha
*/
export const updateUser = async (req, res) =>{
    const userData = req.body;
    const idUser=req.params.id;
    const userUpdated = await usersManager.updateUser(idUser,userData);
    userUpdated
    ? res.status(201).send({status: "Succes", users : userUpdated
        })
        : res.status(404).send({status: "ERROR"})
        
}
