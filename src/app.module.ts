import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import * as crypto from 'crypto';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports : [ConfigModule], 
      useFactory: (configService: ConfigService) =>({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [join(process.cwd(), 'dist/**/*.entity.js')], 
        synchronize: true, 
      }), 
      inject : [ConfigService], 
    }),
    TypeOrmModule.forFeature([User]),
    //Token JWT
    JwtModule.register({ 
      secret: 'secret123456789',
      signOptions :{ expiresIn : '15m' }
     })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
