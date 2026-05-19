import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RequestUserOwnershipGuard } from 'src/common';
import { StudentDashboardService } from './student-dashboard.service';

@ApiTags('Dashboard')
@UseGuards(AuthGuard('firebase-auth'), RequestUserOwnershipGuard)
@ApiBearerAuth()
@Controller('dashboard')
export class StudentDashboardController {
  constructor(
    private readonly studentDashboardService: StudentDashboardService,
  ) {}

  @Get('student')
  @ApiOperation({
    summary: 'Retorna os dados agregados do painel inicial do estudante',
  })
  @ApiResponse({
    status: 200,
    description: 'Painel retornado com sucesso.',
  })
  async getStudentDashboard(
    @Req() req,
    @Query('characterSlug') characterSlug?: string,
  ) {
    return this.studentDashboardService.getDashboard(
      req.user.uid,
      characterSlug,
    );
  }
}
