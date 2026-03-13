import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SchoolsService } from './schools.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SchoolDto } from './dto/school.dto';

@ApiTags('Escolas')
@UseGuards(AuthGuard('firebase-auth'))
@ApiBearerAuth()
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista escolas', description: 'Retorna todas as escolas.' })
  @ApiOkResponse({ type: [SchoolDto] })
  async getAll() {
    return this.schoolsService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca escola por ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID da escola' })
  @ApiOkResponse({ type: SchoolDto })
  async getOne(@Param('id') id: string) {
    return this.schoolsService.getOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria escola' })
  @ApiBody({ type: SchoolDto })
  @ApiResponse({ status: 201, description: 'Escola criada com sucesso.' })
  async create(@Body() school: SchoolDto) {
    return this.schoolsService.create(school);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza escola' })
  @ApiParam({ name: 'id', required: true, description: 'ID da escola' })
  @ApiBody({ type: SchoolDto })
  async update(@Param('id') id: string, @Body() school: Partial<SchoolDto>) {
    return this.schoolsService.update(id, school);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove escola' })
  @ApiParam({ name: 'id', required: true, description: 'ID da escola' })
  async delete(@Param('id') id: string) {
    return this.schoolsService.delete(id);
  }
}
