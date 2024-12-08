/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  canActivate(context: ExecutionContext) {
    console.log('LocalAuthGuard - Ativando guard...');
    return super.canActivate(context);
  }

  handleRequest(err, user, info: Error, context: ExecutionContext) {
    console.log('LocalAuthGuard - Erro:', err);
    console.log('LocalAuthGuard - Usuário:', user);
    console.log('LocalAuthGuard - Info:', info);

    if (err || !user) {
      throw new UnauthorizedException(
        'Credenciais inválidas. Detalhes: ' + info?.message ||
          'Erro desconhecido',
      );
    }

    return user;
  }
}
