import mongoose from 'mongoose'

export default class MongoManager{

    constructor(url){
        this.url = url
    }

    connect(){
        return mongoose.connect(this.url)
            .then( connect => console.log("DB Connection Succesful"))
            .catch( error => console.log(error))
    }

}