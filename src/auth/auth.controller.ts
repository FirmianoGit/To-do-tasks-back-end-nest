import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthRequest } from '../Common/Auth-models/AuthRequest';
import { IsPublic } from '../Common/Decorators/is-public.decorator';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './Guards/local-auth.guard';

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
}
