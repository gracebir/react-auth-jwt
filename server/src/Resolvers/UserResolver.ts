import { Resolver, Query, Mutation, Arg,Ctx, Field, ObjectType, UseMiddleware } from 'type-graphql';
import { hash, compare } from 'bcryptjs'
import { User } from '../entity/User';

import { MyContext } from '../interfaces/MyContext';
import { createRefreshToken, createAccessToken} from '../auth/auth';
import { isAuth } from '../auth/isAuth';
import { sendRefreshToken } from '../auth/sendRefreshToken';


@ObjectType()
class LoginResponse{
    @Field()
    accessToken: string
}



@Resolver()
export class UserResolver{
    @Query(()=> String)
    hello(){
        return 'hi!'
    }


    @Query(()=> String)
    @UseMiddleware(isAuth)
    bye(
        @Ctx() { payload}: MyContext
    ){
        return `your user id is : ${payload!.userId}`
    }



    @Query(()=> [User])
    users(){
        return User.find();
    }



    @Mutation(()=> Boolean)
    async register(
        @Arg('name') name: string,
        @Arg('email') email: string,
        @Arg('password') password: string,
    ){
        const hashedPassword = await hash(password, 12);

        try {
            await User.insert({
                name,
                email,
                password: hashedPassword,
            });

            
        } catch (error) {
            console.log(error);
        }
        return true;
    }


    


    @Mutation(()=> LoginResponse)
    async login(
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Ctx() { res } : MyContext
    ): Promise<LoginResponse> {

        const user = await User.findOne({ where: { email }});
        if(!user){
            throw new Error(' could not find find user');
        }

        const valid = compare(password, user.password);

        if(!valid){
            throw new Error('bad password')
        }
        
        //login successful
        sendRefreshToken(res, createRefreshToken(user));

        return {
            accessToken:createAccessToken(user)
        }
    }
}