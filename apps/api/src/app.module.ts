import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth';
import { FirebaseModule } from './firebase';
import { GamesModule } from './games/games.module';
import { CharactersModule } from './characters/characters.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    FirebaseModule,
    GamesModule,
    CharactersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
