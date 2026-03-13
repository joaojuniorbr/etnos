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
import { LoginResponseDto, ProfileResponseDto } from './dto/auth-profile.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RegisterDto } from './dto/register.dto';
import { RecoveryDto } from './dto/recovery.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

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
  async login(@Body() body: LoginDto) {
    return this.authService.loginWithEmailAndPassword(
      body.email,
      body.password,
    );
  }

  @Post('register')
  @ApiOperation({
    summary: 'Cadastro com e-mail e senha',
    description: 'Cria conta e perfil base do usuário.',
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() body: RegisterDto) {
    return this.authService.registerWithEmailAndPassword(body);
  }

  @Post('google')
  @ApiOperation({
    summary: 'Login com Google',
    description:
      'Valida um Firebase ID token do login com Google e garante o perfil do usuário.',
  })
  @ApiBody({ type: GoogleLoginDto })
  @ApiResponse({
    status: 201,
    description: 'Login com Google realizado com sucesso.',
    type: LoginResponseDto,
  })
  async googleLogin(@Body() body: GoogleLoginDto) {
    return this.authService.loginWithGoogle(body.idToken);
  }

  @Post('recovery')
  @ApiOperation({
    summary: 'Recuperação de senha',
    description: 'Dispara e-mail de recuperação de senha.',
  })
  @ApiBody({ type: RecoveryDto })
  async recovery(@Body() body: RecoveryDto) {
    return this.authService.sendRecoveryEmail(body.email);
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
  async updateProfile(@Req() req, @Body() body: UpdateProfileDto) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return this.authService.updateProfile(req.user.uid, body);
  }
}
