import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'; // Importando decoradores para validação

export class CreateUsuarioDto {
  @IsEmail() // valida se o campo está no formato correto
  @IsNotEmpty() // Garante que o campo não esteja vazio
  email: string;

  @IsString() // Garante que o campo seja uma string
  @IsNotEmpty() // Garante que o campo não esteja vazio
  @Length(3, 255) // Verifica que o nome do usuário tenha entre 3 e 255 caracteres
  nomeUsuario: string;

  @IsString() // Garante que o campo seja uma string
  @IsNotEmpty() // Garante que o campo não esteja vazio
  @Length(6, 255) // Verifica que a senha tenha entre 6 e 255 caracteres
  senha: string;
}
