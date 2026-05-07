import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminRoleGuard, SchoolRoleGuard } from 'src/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Usuarios')
@UseGuards(AuthGuard('firebase-auth'))
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'Lista usuarios com filtros administrativos' })
  findAll(
    @Query('schoolId') schoolId?: string,
    @Query('search') search?: string,
    @Query('hasPushToken') hasPushToken?: string,
  ) {
    return this.usersService.findAll({
      schoolId,
      search,
      hasPushToken: hasPushToken === 'true',
    });
  }

  @Patch(':id')
  @UseGuards(SchoolRoleGuard)
  @ApiOperation({ summary: 'Atualiza perfil, escola e status de um usuario' })
  update(@Req() req, @Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.updateUser(req.user.uid, id, body);
  }
}
