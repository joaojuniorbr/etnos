import { ApiProperty } from '@nestjs/swagger';

export class ValidateGuessGameDto {
  @ApiProperty({ example: 'guess-anita-bomba-bomba-1' })
  contentId: string;

  @ApiProperty({ example: 'b' })
  guess: string;

  @ApiProperty({ enum: ['letter', 'word'] })
  type: 'letter' | 'word';

  @ApiProperty({ example: 'B••••', required: false })
  currentGuesses?: string;
}
