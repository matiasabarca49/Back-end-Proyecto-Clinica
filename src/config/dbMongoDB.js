import mongoose from 'mongoose'

export default class MongoManager{

    constructor(url){
        this.url = url
    }

    connect(){
        return mongoose.connect(this.url)
            .then( connect => {
                 console.log("✅ [OK] Conexión a la DB: ÉXITO");
            })
            .catch( error => {
                console.log("🔴 [Error] Conexión a la DB: FALLÓ");
                console.log(error)
            })
    }

}