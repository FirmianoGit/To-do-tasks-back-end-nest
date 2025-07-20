import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { TrocarSenhaDto } from './dto/trocar-senha.dto';
import { UsuarioService } from './usuario.service';
import { IsPublic } from 'src/Common/Decorators/is-public.decorator';

@Controller('users')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  /**
   * Cria um novo usuário no sistema.
   * Este endpoint é público e não requer autenticação.
   * 
   * @param createUsuarioDto Dados do usuário a ser criado
   * @returns Usuário criado
   */
  @IsPublic()
  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  /**
   * Atualiza os dados de um usuário existente.
   * 
   * @param id ID do usuário a ser atualizado
   * @param updateUsuarioDto Dados atualizados do usuário
   * @returns Usuário atualizado
   */
  @Put(':id')
  update(@Param('id') id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  /**
   * Troca a senha do usuário autenticado.
   * 
   * @param trocarSenhaDto Dados para troca de senha (senha atual e nova senha)
   * @returns Confirmação da troca de senha
   */
  @IsPublic()
  @Post('trocar-senha')
  trocarSenha(@Body() trocarSenhaDto: TrocarSenhaDto) {
    return this.usuarioService.changePassword(trocarSenhaDto.email, trocarSenhaDto.senha);
  }

  /**
   * Remove um usuário do sistema pelo ID.
   * 
   * @param id ID do usuário a ser removido
   * @returns Confirmação da remoção
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(+id);
  } 
}
