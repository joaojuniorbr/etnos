import { ApiProperty } from '@nestjs/swagger';

export class ContactDto {
  @ApiProperty({
    example: '(11) 99999-0000',
    description: 'Telefone para retorno do contato.',
  })
  phone: string;
}
