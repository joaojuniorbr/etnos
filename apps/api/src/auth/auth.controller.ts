import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { LoginResponseDto, ProfileResponseDto } from './auth.profile.dto';

class LoginDto {
  @ApiProperty({
    example: 'usuario@etnos.com',
    description: 'Email de acesso do usuário.',
  })
  email: string;

  @ApiProperty({
    description: 'Credencial secreta do usuário.',
  })
  password: string;
}

class UpdateProfileDto {
  @ApiProperty({
    example: 'Joao Silva',
    required: false,
    description: 'Nome do responsável.',
  })
  parentName?: string;

  @ApiProperty({
    example: 'Enzo Silva',
    required: false,
    description: 'Nome da criança.',
  })
  childName?: string;

  @ApiProperty({
    example: '2019-01-31',
    required: false,
    description: 'Data de nascimento da criança (YYYY-MM-DD).',
  })
  childBirthDate?: string;

  @ApiProperty({
    example: '(41) 99999-1234',
    required: false,
    description: 'Telefone do responsável.',
  })
  parentPhone?: string;

  @ApiProperty({
    example: 'Escola Municipal Modelo',
    required: false,
    description: 'Escola da criança.',
  })
  school?: string;
}

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login com e-mail e senha',
    description: 'Autentica o usuário e retorna o token de acesso.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Credenciais de acesso',
  })
  @ApiResponse({
    status: 201,
    description: 'Login realizado com sucesso.',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.loginWithEmailAndPassword(
      body.email,
      body.password,
    );
  }

  @UseGuards(AuthGuard('firebase-auth'))
  @Get('profile')
  @ApiOperation({
    summary: 'Perfil do usuário autenticado',
    description: 'Retorna os dados do perfil do usuário logado.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Perfil retornado com sucesso.',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado.' })
  async profile(@Req() req) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return this.authService.getProfile(req.user.uid);
  }

  @UseGuards(AuthGuard('firebase-auth'))
  @Post('profile')
  @ApiOperation({
    summary: 'Atualizar perfil do usuário autenticado',
    description: 'Atualiza os dados do perfil do usuário logado.',
  })
  @ApiBody({
    type: UpdateProfileDto,
    description: 'Dados do perfil que podem ser atualizados.',
    examples: {
      atualizacaoBasica: {
        summary: 'Atualização básica',
        value: {
          parentName: 'Joao Silva',
          childName: 'Enzo Silva',
          school: 'Escola Municipal Modelo',
          parentPhone: '(41) 99999-1234',
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Perfil atualizado com sucesso.',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado.' })
  async updateProfile(@Req() req, @Body() body) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return this.authService.updateProfile(req.user.uid, body);
  }
}
