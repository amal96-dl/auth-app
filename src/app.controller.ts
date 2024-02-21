import { BadRequestException, Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { use } from 'passport';
import { Request, Response, response } from 'express';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService,
    private  jwtService: JwtService) {}
   //Register a new user
  @Post('register')
  async register (
    @Body('username') username:string,
    @Body('password') password:string,
    @Body('profile') profile:string,
  )
   {
    const hashPassword = await bcrypt.hash(password,12) ;

    const user  =  await this.appService.create( {
      username,
      password : hashPassword,
      profile
     });
     //remove the password from the reponse for security
     delete user.password;
     return user;
   }
   //Login a  user
   @Post('login')
   async login (
     @Body('username') username:string,
     @Body('password') password:string,
     @Res({passthrough: true}) response:Response)
    {
     const user = await this.appService.findOne( {username}) ;
    if (!user) 
    {
      throw new BadRequestException('Invalid credentials');
    }
    //Compare the new password  and the crypted password
    if (await bcrypt.compare(password, user.password)) 
    {
      throw new BadRequestException('Invalid credentials');
    }
    //Generate Token 
    const jwt = await this.jwtService.signAsync({id: user.id});

    response.cookie('jwt',jwt, {httpOnly: true})
    return {
      message :'Success'
    } ;
    }
     //Get the user
    @Get('User')
    async user(@Req() request:Request,)
    {
    try{

      const cookie = request.cookies['jwt'];
      const data = await this.jwtService.verifyAsync(cookie);
      if (!data) 
      {
        throw new UnauthorizedException();
      }

      //Get the user Now
      const user =  await this.appService.findOne({id:data['id']});

      //hide the pass from response user
      const {password, ...result}  =  user;
      return result;

    } catch(e)  {
     throw new UnauthorizedException();
    }
    } 
    //logout to Clear the cookie
    @Post('logout')
    async logout (@Res({passthrough: true}) response:Response){
     //Clear the cookie 

     response.clearCookie('jwt');
     return {
      message :'Logout with Success'
    } ;
     }
}
