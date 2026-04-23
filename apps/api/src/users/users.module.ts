import { Module } from '@nestjs/common';
import { AdminRoleGuard, SchoolRoleGuard } from 'src/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, AdminRoleGuard, SchoolRoleGuard],
})
export class UsersModule {}
