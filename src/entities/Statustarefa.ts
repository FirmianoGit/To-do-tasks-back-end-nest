import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Historicotarefa } from './Historicotarefa';
import { Tarefas } from './Tarefas';

@Entity('statustarefa', { schema: 'teksystem' }) // Define a tabela 'statustarefa' no schema 'teksystem'
export class Statustarefa {
  // Coluna gerada automaticamente como chave primária da tabela
  @PrimaryGeneratedColumn({ type: 'int', name: 'StatusID' })
  statusId: number; // A chave primária 'statusId' será um número inteiro gerado automaticamente.

  // Coluna para armazenar o nome do status. O valor pode ser 'Pendente', 'Em Progresso' ou 'Concluída'.
  @Column('enum', {
    name: 'NomeStatus',
    enum: ['Pendente', 'Em Progresso', 'Concluída'],
  })
  nomeStatus: 'Pendente' | 'Em Progresso' | 'Concluída'; // Representa o nome do status da tarefa.

  // Relacionamento OneToMany com a entidade Historicotarefa (status anterior). Uma entrada no histórico pode ter vários status antigos.
  @OneToMany(
    () => Historicotarefa,
    (historicotarefa) => historicotarefa.statusAntigo,
  )
  historicotarefas: Historicotarefa[]; // Representa os históricos de mudanças de status anteriores para as tarefas.

  // Relacionamento OneToMany com a entidade Historicotarefa (status novo). Uma entrada no histórico pode ter vários status novos.
  @OneToMany(
    () => Historicotarefa,
    (historicotarefa) => historicotarefa.statusNovo,
  )
  historicotarefas2: Historicotarefa[]; // Representa os históricos de mudanças de status novos para as tarefas.

  // Relacionamento OneToMany com a entidade Tarefas. Um status pode estar associado a várias tarefas.
  @OneToMany(() => Tarefas, (tarefas) => tarefas.status)
  tarefas: Tarefas[]; // Representa as tarefas associadas a esse status.
}
