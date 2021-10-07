import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { ApolloServer } from 'apollo-server-express';
import { buildSchema} from 'type-graphql'
import { UserResolver } from "./Resolvers/UserResolver";
import { createConnection } from "typeorm";
import cookieParser from "cookie-parser";
import { verify } from 'jsonwebtoken'
import { User } from "./entity/User";
import { createAccessToken, createRefreshToken } from "./auth/auth";
import { sendRefreshToken } from "./auth/sendRefreshToken";


const main = async () => {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    await createConnection()

    app.post('/refresh_token', async (req, res)=>{
        const token = req.cookies.jid;
        if(!token){
            return res.send({ok: false, accessToken:''});
        }

        let payload:any = null; 

        try {
           payload = verify(token, process.env.REFRESH_TOKEN!)
        } catch (err) {
            console.log(err);
            return res.send({ok: false, accessToken:''});
        }

        // this is a valid token and 
        // we can send back an access token

        const user = await User.findOne({id: payload.userId});
        if(!user){
            return res.send({ok: false, accessToken:""})
        }

        if(user.tokenVersion !== payload.tokenVersion){
            return res.send({ok: false, accessToken:""})
        }

        sendRefreshToken(res, createRefreshToken(user))


        return res.send({ok: true, accessToken:createAccessToken(user)})
    })

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
           resolvers: [UserResolver] 
        }), 
        context : ({req: Request, res: Response}) => ({req: Request, res: Response})
    });

    apolloServer.applyMiddleware({ app })
    app.listen(4000, ()=>{
        console.log('server started');
    })
}

main().catch((error)=> console.log(error));

