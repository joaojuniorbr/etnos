import { Module } from '@nestjs/common';
import { StudentDashboardController } from './student/student-dashboard.controller';
import { StudentDashboardService } from './student/student-dashboard.service';

@Module({
  controllers: [StudentDashboardController],
  providers: [StudentDashboardService],
  exports: [StudentDashboardService],
})
export class DashboardModule {}
