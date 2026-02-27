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
} from '@nestjs/swagger';
import { LoginResponseDto, ProfileResponseDto } from './auth.profile.dto';

class LoginDto {
  email: string;
  password: string;
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
}
