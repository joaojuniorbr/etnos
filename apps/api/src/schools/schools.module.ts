import { Module } from '@nestjs/common';
import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service';
import { AdminRoleGuard, SchoolRoleGuard } from 'src/common';
import { GamesModule } from 'src/games/games.module';

@Module({
  imports: [GamesModule],
  controllers: [SchoolsController],
  providers: [SchoolsService, AdminRoleGuard, SchoolRoleGuard],
})
export class SchoolsModule {}
