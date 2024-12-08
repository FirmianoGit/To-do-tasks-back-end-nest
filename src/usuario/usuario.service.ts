import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Usuarios } from 'src/entities/Usuarios'; // Entidade de usuário
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto'; // DTO para criar usuário
import { UpdateUsuarioDto } from './dto/update-usuario.dto'; // DTO para atualizar usuário

@Injectable()
export class UsuarioService {
  constructor(
    @Inject('USUARIO_REPOSITORY')
    private readonly usuariosRepository: Repository<Usuarios>, // Repositório de usuários
  ) {}

  // Criar um novo usuário
  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuarios> {
    // Criar o novo usuário
    const usuario = this.usuariosRepository.create(createUsuarioDto);

    // Salvar no banco de dados
    return this.usuariosRepository.save(usuario);
  }

  // Atualizar um usuário existente
  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuarios> {
    const usuario = await this.usuariosRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    // Atualizar as informações do usuário
    Object.assign(usuario, updateUsuarioDto);

    return this.usuariosRepository.save(usuario);
  }

  // Remover um usuário
  async remove(id: number): Promise<void> {
    const usuario = await this.usuariosRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    // Remover o usuário do banco de dados
    await this.usuariosRepository.remove(usuario);
  }

  // Buscar um usuário por email
  async findByEmail(email: string): Promise<Usuarios> {
    const usuario = await this.usuariosRepository.findOne({ where: { email } });

    if (!usuario) {
      throw new NotFoundException(`Usuário com email ${email} não encontrado.`);
    }

    return usuario;
  }
}
