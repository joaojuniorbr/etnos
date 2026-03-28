import { ApiProperty } from '@nestjs/swagger';

export class SaveGuessGameContentDto {
  @ApiProperty({ example: 'guess-content-id', required: false })
  id?: string;

  @ApiProperty({ example: 'Chimarrao' })
  title: string;

  @ApiProperty({ example: 'Bomba' })
  word: string;

  @ApiProperty({
    example: ['Uso para beber chimarrão.', 'Tenho furinhos na ponta.'],
    type: [String],
  })
  tips: string[];

  @ApiProperty({
    example: 'https://example.com/imagem.jpg',
    required: false,
    nullable: true,
  })
  imageUrl?: string | null;

  @ApiProperty({
    example:
      'A bomba é o canudo de metal usado para beber o chimarrão, filtrando a erva.',
  })
  description: string;

  @ApiProperty({ example: 'anita' })
  characterSlug: string;
}
