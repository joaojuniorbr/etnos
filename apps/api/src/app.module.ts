import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth';
import { FirebaseModule } from './firebase';
import { GamesModule } from './games/games.module';
import { CharactersModule } from './characters/characters.module';
import { PublicModule } from './public/public.module';
import { EmailModule } from './email/email.module';
import { SchoolsModule } from './schools/schools.module';
import { MidiaModule } from './midia/midia.module';
import { PrismaModule } from './prisma';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    FirebaseModule,
    GamesModule,
    CharactersModule,
    SchoolsModule,
    PublicModule,
    EmailModule,
    MidiaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
