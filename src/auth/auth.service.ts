import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuarios } from 'src/entities/Usuarios';
import { UsuarioService } from 'src/usuario/usuario.service';
import { UserPayload } from '../Common/Auth-models/UserPayload';
import { UserToken } from '../Common/Auth-models/UserToken';
import { UpdateUsuarioDto } from 'src/usuario/dto/update-usuario.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}

  // Validar as credenciais do usuário
  async ValidarUsuario(email: string, senha: string) {
    console.log('Validando usuário com email:', email); // Depuração
    const Usuario = await this.userService.findByEmail(email);

    if (!Usuario) {
      console.log('Usuário não encontrado'); // Depuração
      return null;
    }

    const SenhaValida = await bcrypt.compare(senha, Usuario.senha);

    if (!SenhaValida) {
      console.log('Senha incorreta'); // Depuração
      return null;
    }

    console.log('Usuário autenticado com sucesso'); // Depuração
    return {
      ...Usuario,
      senha: undefined, // Remove a senha do retorno
    };
  }

  // Gerar token JWT para o usuário autenticado
  async login(usuario: Usuarios): Promise<UserToken & { usuario: any }> {
    const payload: UserPayload = {
      sub: usuario.id,
      chave: usuario.email,
    };

    const jwtToken = this.jwtService.sign(payload);

    // Remove a senha do objeto usuário antes de retornar
    const { senha, ...usuarioSemSenha } = usuario;

    return {
      access_token: jwtToken,
      usuario: usuarioSemSenha,
    };
  }

  // Trocar a senha de um usuário já existente
  // Recebe o usuário (entidade) e a nova senha em texto puro
  // Mantém o mesmo nível de encriptação (bcrypt com salt rounds = 10) usando o método do UsuarioService
  async trocarSenha(usuario: UpdateUsuarioDto, novaSenha: string): Promise<void> {
    if (!usuario || !usuario.email) {
      throw new Error('Usuário inválido fornecido para troca de senha.');
    }

    if (!novaSenha || typeof novaSenha !== 'string' || novaSenha.trim().length < 6) {
      throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
    }

    // Reaproveita o método já existente no UsuarioService que faz validações e hashing
    await this.userService.changePassword(usuario.email, novaSenha);
  }
}
