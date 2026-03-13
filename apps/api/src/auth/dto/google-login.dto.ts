import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'Firebase ID token retornado após autenticação com Google.',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
  })
  idToken: string;
}
