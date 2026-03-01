import { Body, Controller, Post } from '@nestjs/common';
import { PublicService } from './public.service';
import {
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

class ContactDto {
  @ApiProperty({
    example: '(11) 99999-0000',
    description: 'Telefone para retorno do contato.',
  })
  phone: string;
}

@ApiTags('Público')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Post('contact')
  @ApiOperation({
    summary: 'Solicitar contato',
    description: 'Recebe um telefone da landing page e dispara um email para o time.',
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
}
