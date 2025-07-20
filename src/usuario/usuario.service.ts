import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { Usuarios } from 'src/entities/Usuarios'; // Entidade de usuário
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto'; // DTO para criar usuário
import { UpdateUsuarioDto } from './dto/update-usuario.dto'; // DTO para atualizar usuário
import * as bcrypt from 'bcryptjs'; // Biblioteca para criptografia

@Injectable()
export class UsuarioService {
  constructor(
    @Inject('USUARIO_REPOSITORY')
    private readonly usuariosRepository: Repository<Usuarios>, // Repositório de usuários
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuarios> {
    try {
      // Criptografar a senha antes de salvar no banco
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(createUsuarioDto.senha, salt);
      console.log(hashedPassword);

      // Substituir a senha pelo hash no DTO
      createUsuarioDto.senha = hashedPassword;

      // Criar o novo usuário
      const usuario = this.usuariosRepository.create(createUsuarioDto);

      // Salvar no banco de dados
      return await this.usuariosRepository.save(usuario);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Email ou nome de usuário já cadastrados.');
      }
      throw new InternalServerErrorException('Erro ao criar usuário.');
    }
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuarios> {
    try {
      const usuario = await this.usuariosRepository.findOne({
        where: { id: Number(id) },
      });

      if (!usuario) {
        throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
      }

      Object.assign(usuario, updateUsuarioDto);

      return await this.usuariosRepository.save(usuario);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao atualizar usuário.');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const usuario = await this.usuariosRepository.findOne({ where: { id } });

      if (!usuario) {
        throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
      }

      // Remover o usuário do banco de dados
      await this.usuariosRepository.remove(usuario);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao remover usuário.');
    }
  }

  //trocar a senha com o email
  async changePassword(email: string, senha: string): Promise<void> {
    try {
      if (!email || !senha) {
        throw new BadRequestException('Email e nova senha são obrigatórios.');
      }

      const usuario = await this.usuariosRepository.findOne({ where: { email } });

      if (!usuario) {
        throw new NotFoundException(`Usuário com email ${email} não encontrado.`);
      }

      if (typeof senha !== 'string' || senha.trim().length < 6) {
        throw new BadRequestException('A nova senha deve ter pelo menos 6 caracteres.');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(senha, salt);

      usuario.senha = hashedPassword;

      await this.usuariosRepository.save(usuario);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erro ao trocar a senha do usuário. Detalhes: ' + (error.message || error),
      );
    }
  }

  async findByEmail(email: string): Promise<Usuarios> {
    try {
      const usuario = await this.usuariosRepository.findOne({
        where: { email },
      });

      if (!usuario) {
        throw new NotFoundException(
          `Usuário com email ${email} não encontrado.`,
        );
      }

      return usuario;
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao buscar usuário por email. Detalhes: ' + error.message,
      );
    }
  }
}
