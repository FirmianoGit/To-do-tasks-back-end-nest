import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Tarefas } from './Tarefas';

@Entity('usuarios', { schema: 'teksystem' }) // Define a entidade 'Usuarios' para a tabela 'usuarios' no schema 'teksystem'
export class Usuarios {
  // Coluna id gerada automaticamente como chave primária
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number; // O id será um número inteiro gerado automaticamente.

  // Coluna para armazenar o email, com limite de 255 caracteres e índice único
  @Column('varchar', { name: 'email', unique: true, length: 255 })
  email: string; // Armazena o email como string com limite de 255 caracteres.

  // Coluna para armazenar o nome de usuário, com limite de 255 caracteres e índice único
  @Column('varchar', { name: 'nomeUsuario', unique: true, length: 255 })
  nomeUsuario: string; // Armazena o nome do usuário como string com limite de 255 caracteres.

  // Coluna para armazenar a senha do usuário com limite de 255 caracteres
  @Column('varchar', { name: 'senha', length: 255 })
  senha: string; // Armazena a senha como string com limite de 255 caracteres.

  // Relacionamento OneToMany com a entidade Tarefas. Cada usuário pode ter várias tarefas.
  @OneToMany(() => Tarefas, (tarefas) => tarefas.usuario)
  tarefas: Tarefas[]; // Representa as tarefas associadas a este usuário. Uma relação OneToMany.
}
