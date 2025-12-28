import { ApiProperty } from '@nestjs/swagger';

class TimestampDto {
  @ApiProperty({ description: 'Segundos desde a época Unix' })
  _seconds: number;

  @ApiProperty({ description: 'Nanosegundos adicionais' })
  _nanoseconds: number;
}

export class ProfileResponseDto {
  @ApiProperty()
  uid: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  parentName: string;

  @ApiProperty()
  childName: string;

  @ApiProperty()
  childBirthDate: boolean;

  @ApiProperty({ type: [String] })
  roles: string[];

  @ApiProperty({ type: TimestampDto })
  createdAt: TimestampDto;

  @ApiProperty({ type: TimestampDto })
  updatedAt: TimestampDto;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Token JWT de acesso gerado após autenticação',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  idToken: string;

  @ApiProperty({
    description: 'Token de atualização para renovar o acesso',
    example: 'AEu4IL1z...XyZ',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Tempo de expiração do token em segundos',
    example: '3600',
  })
  expiresIn: string;

  @ApiProperty({
    description: 'Identificador único do usuário autenticado',
    example: 'abc123XYZ',
  })
  localId: string;
}
