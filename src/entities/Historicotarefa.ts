import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tarefas } from './Tarefas';
import { Statustarefa } from './Statustarefa';

@Index('StatusAntigoID', ['statusAntigoId'], {})
@Index('StatusNovoID', ['statusNovoId'], {})
@Index('historicotarefa_ibfk_1', ['tarefaId'], {})
@Entity('historicotarefa', { schema: 'teksystem' }) // Define a tabela 'historicotarefa' no schema 'teksystem'
export class Historicotarefa {
  // Coluna gerada automaticamente como chave primária da tabela
  @PrimaryGeneratedColumn({ type: 'int', name: 'HistoricoID' })
  historicoId: number; // A chave primária 'historicoId' será um número inteiro gerado automaticamente.

  // Coluna que armazena o ID da tarefa associada a esse histórico.
  @Column('int', { name: 'TarefaID', nullable: true })
  tarefaId: number | null; // Pode ser nulo, pois nem todo histórico está necessariamente associado a uma tarefa.

  // Coluna que armazena o ID do status antigo da tarefa.
  @Column('int', { name: 'StatusAntigoID', nullable: true })
  statusAntigoId: number | null; // Pode ser nulo, caso o histórico não tenha um status antigo.

  // Coluna que armazena o ID do status novo da tarefa.
  @Column('int', { name: 'StatusNovoID', nullable: true })
  statusNovoId: number | null; // Pode ser nulo, caso o histórico não tenha um status novo.

  // Coluna que armazena a data e hora da alteração do status da tarefa.
  @Column('timestamp', {
    name: 'AlteradoEm',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  alteradoEm: Date | null; // Representa a data e hora em que o status da tarefa foi alterado.

  // Relacionamento ManyToOne com a entidade Tarefas. Um histórico está associado a uma tarefa específica.
  @ManyToOne(() => Tarefas, (tarefas) => tarefas.historicotarefas, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'TarefaID', referencedColumnName: 'taskId' }])
  tarefa: Tarefas; // Representa a tarefa à qual este histórico de status está associado.

  // Relacionamento ManyToOne com a entidade Statustarefa (status antigo). Um histórico está associado a um status antigo.
  @ManyToOne(
    () => Statustarefa,
    (statustarefa) => statustarefa.historicotarefas,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  )
  @JoinColumn([{ name: 'StatusAntigoID', referencedColumnName: 'statusId' }])
  statusAntigo: Statustarefa; // Representa o status antigo da tarefa no momento da alteração.

  // Relacionamento ManyToOne com a entidade Statustarefa (status novo). Um histórico está associado a um status novo.
  @ManyToOne(
    () => Statustarefa,
    (statustarefa) => statustarefa.historicotarefas2,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  )
  @JoinColumn([{ name: 'StatusNovoID', referencedColumnName: 'statusId' }])
  statusNovo: Statustarefa; // Representa o novo status da tarefa após a alteração.
}
