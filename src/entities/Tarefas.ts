import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Historicotarefa } from './Historicotarefa';
import { Statustarefa } from './Statustarefa';
import { Usuarios } from './Usuarios';

@Index('StatusID', ['statusId'], {}) // Cria um índice para a coluna 'statusId' para otimizar buscas
@Index('UsuarioID', ['usuarioId'], {}) // Cria um índice para a coluna 'usuarioId' para otimizar buscas
@Entity('tarefas', { schema: 'teksystem' }) // Define a tabela 'tarefas' no schema 'teksystem'
export class Tarefas {
  // Coluna gerada automaticamente como chave primária da tabela
  @PrimaryGeneratedColumn({ type: 'int', name: 'TaskID' })
  taskId: number; // A chave primária 'taskId' será um número inteiro gerado automaticamente.

  // Coluna para o título da tarefa, com limite de 255 caracteres
  @Column('varchar', { name: 'Titulo', length: 255 })
  titulo: string; // Armazena o título da tarefa como uma string com limite de 255 caracteres.

  // Coluna para a descrição da tarefa, usando o tipo 'text' para armazenar texto mais longo
  @Column('text', { name: 'Descricao' })
  descricao: string; // Armazena a descrição da tarefa como texto.

  // Coluna para armazenar o status da tarefa, permitindo que seja nulo
  @Column('int', { name: 'StatusID', nullable: true })
  statusId: number | null; // Representa o status da tarefa. Pode ser nulo se não houver status atribuído.

  // Coluna para armazenar o usuário associado à tarefa, permitindo que seja nulo
  @Column('int', { name: 'UsuarioID', nullable: true })
  usuarioId: number | null; // Representa o ID do usuário responsável pela tarefa. Pode ser nulo se não houver usuário atribuído.

  // Coluna para armazenar a data e hora em que a tarefa foi criada, com valor padrão de 'CURRENT_TIMESTAMP'
  @Column('timestamp', {
    name: 'CriadoEm',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  criadoEm: Date | null; // Armazena a data de criação da tarefa. O valor é gerado automaticamente.

  // Coluna para armazenar a prioridade da tarefa, com valor representado por um número inteiro
  @Column('tinyint', { name: 'Prioridade' })
  prioridade: number; // Representa a prioridade da tarefa com um valor numérico (geralmente entre 1 e 5).

  // Relacionamento OneToMany com a entidade Historicotarefa. Uma tarefa pode ter muitos históricos.
  @OneToMany(() => Historicotarefa, (historicotarefa) => historicotarefa.tarefa)
  historicotarefas: Historicotarefa[]; // Representa os históricos associados a esta tarefa.

  // Relacionamento ManyToOne com a entidade Statustarefa. Cada tarefa tem um único status.
  @ManyToOne(() => Statustarefa, (statustarefa) => statustarefa.tarefas, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'StatusID', referencedColumnName: 'statusId' }])
  status: Statustarefa; // Representa o status da tarefa. Está associado ao 'statusId' da tabela 'Statustarefa'.

  // Relacionamento ManyToOne com a entidade Usuarios. Cada tarefa é atribuída a um único usuário.
  @ManyToOne(() => Usuarios, (usuarios) => usuarios.tarefas, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'UsuarioID', referencedColumnName: 'id' }])
  usuario: Usuarios; // Representa o usuário responsável pela tarefa. Está associado ao 'usuarioId' da tabela 'Usuarios'.
}
