import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth';
import { FirebaseModule } from './firebase';
import { GamesModule } from './games/games.module';
import { CharactersModule } from './characters/characters.module';
import { PublicModule } from './public/public.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    FirebaseModule,
    GamesModule,
    CharactersModule,
    PublicModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
