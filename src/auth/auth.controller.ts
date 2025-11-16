import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  Body,
} from '@nestjs/common';
import { AuthRequest } from '../Common/Auth-models/AuthRequest';
import { IsPublic } from '../Common/Decorators/is-public.decorator';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './Guards/local-auth.guard';
import { JwtAuthGuard } from './Guards/jwt-auth.guard';
import { TrocarSenhaDto } from '../usuario/dto/trocar-senha.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Autentica um usuário e retorna um token JWT.
   * Este endpoint é público e não requer autenticação prévia.
   * 
   * @param req Requisição contendo as credenciais do usuário
   * @returns Token JWT para autenticação
   */
  @IsPublic()
  @Post('auth')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: AuthRequest) {
    return this.authService.login(req.user);
  }

  /**
   * Trocar senha do usuário autenticado.
   * Rota protegida por JWT: requer header Authorization: Bearer <token>
   */
  @Post('auth/trocar-senha')
  @UseGuards(JwtAuthGuard)
  async trocarSenha(@Request() req: any, @Body() dto: TrocarSenhaDto) {
    // O JwtStrategy valida e retorna { id, chave } onde chave é o email
    const userFromJwt = req.user;
    const usuarioLike = { email: userFromJwt.chave } as any;

    await this.authService.trocarSenha(usuarioLike, dto.senha);

    return { message: 'Senha alterada com sucesso.' };
  }
}
