import passport from "passport";
import UserManager from '../DAO/mongo/users.mongo.js'
import { Strategy } from 'passport-google-oauth20'
const GoogleStrategy = Strategy

const userManager = new UserManager()

passport.use('google', 
    new GoogleStrategy({
        clientID:"",
        callbackURL: "",
        scope: ["profile","email"]
    },
    async function(accessToken, refreshToken, profile, done) {
        const dataFormatted = new FormattedDataDB(profile._json)
        console.log(dataFormatted)
        const userFound = await userManager.getUser(dataFormatted.email)
        //Verificar si el usuario existe
        if(userFound){
            done(null, userFound) 
        }else{
            const userAdded = await userManager.postUser(dataFormatted)
            done(null, userAdded) 
        }
    }
));