import { Body, Controller, Get, Post } from '@nestjs/common';
import { PublicService } from './public.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ContactDto } from './dto/contact.dto';

@ApiTags('Público')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Post('contact')
  @ApiOperation({
    summary: 'Solicitar contato',
    description:
      'Recebe um telefone da landing page e dispara um email para o time.',
  })
  @ApiBody({
    type: ContactDto,
    description: 'Dados mínimos para solicitar contato.',
    examples: {
      contatoLanding: {
        summary: 'Contato via landing page',
        value: {
          phone: '(11) 99999-0000',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Contato encaminhado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Telefone inválido.' })
  sendContactEmail(@Body() body: ContactDto) {
    return this.publicService.sendContactEmail(body.phone);
  }

  @Get('schools')
  @ApiOperation({
    summary: 'Listar escolas',
    description: 'Retorna uma lista de escolas cadastradas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de escolas retornada com sucesso.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          name: { type: 'string', example: 'Escola Exemplo' },
        },
      },
    },
  })
  getSchools() {
    return this.publicService.getSchools();
  }
}
