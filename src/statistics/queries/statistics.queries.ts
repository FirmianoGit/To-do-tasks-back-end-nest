import { Repository } from 'typeorm';
import { Tarefas } from 'src/entities/Tarefas';

export class StatisticsQueries {
  
  /**
   * Query para calcular média de prioridade por usuário
   */
  static getMediaPrioridadeQuery(repository: Repository<Tarefas>, usuarioId: number) {
    return repository
      .createQueryBuilder('tarefa')
      .select('AVG(tarefa.prioridade)', 'media')
      .where('tarefa.usuarioId = :usuarioId', { usuarioId });
  }

  /**
   * Query para distribuição de prioridades por usuário
   */
  static getDistribuicaoPrioridadesQuery(repository: Repository<Tarefas>, usuarioId: number) {
    return repository
      .createQueryBuilder('tarefa')
      .select('tarefa.prioridade', 'prioridade')
      .addSelect('COUNT(*)', 'quantidade')
      .where('tarefa.usuarioId = :usuarioId', { usuarioId })
      .groupBy('tarefa.prioridade')
      .orderBy('tarefa.prioridade', 'ASC');
  }

  /**
   * Query para tarefas por dia da semana (últimos 30 dias)
   */
  static getTarefasPorDiaSemanaQuery(repository: Repository<Tarefas>, usuarioId: number) {
    return repository
      .createQueryBuilder('tarefa')
      .select('DAYOFWEEK(tarefa.criadoEm)', 'diaSemana')
      .addSelect('COUNT(*)', 'quantidade')
      .where('tarefa.usuarioId = :usuarioId', { usuarioId })
      .andWhere('tarefa.criadoEm >= DATE_SUB(NOW(), INTERVAL 30 DAY)')
      .groupBy('DAYOFWEEK(tarefa.criadoEm)')
      .orderBy('diaSemana', 'ASC');
  }

  /**
   * Query para tarefas por hora do dia (últimos 30 dias)
   */
  static getTarefasPorHoraQuery(repository: Repository<Tarefas>, usuarioId: number) {
    return repository
      .createQueryBuilder('tarefa')
      .select('HOUR(tarefa.criadoEm)', 'hora')
      .addSelect('COUNT(*)', 'quantidade')
      .where('tarefa.usuarioId = :usuarioId', { usuarioId })
      .andWhere('tarefa.criadoEm >= DATE_SUB(NOW(), INTERVAL 30 DAY)')
      .groupBy('HOUR(tarefa.criadoEm)')
      .orderBy('hora', 'ASC');
  }

  /**
   * Query para tarefas por semana (últimas 12 semanas)
   */
  static getTarefasPorSemanaQuery(repository: Repository<Tarefas>, usuarioId: number) {
    return repository
      .createQueryBuilder('tarefa')
      .select('YEARWEEK(tarefa.criadoEm)', 'semana')
      .addSelect('COUNT(*)', 'quantidade')
      .where('tarefa.usuarioId = :usuarioId', { usuarioId })
      .andWhere('tarefa.criadoEm >= DATE_SUB(NOW(), INTERVAL 12 WEEK)')
      .groupBy('YEARWEEK(tarefa.criadoEm)')
      .orderBy('semana', 'ASC');
  }

  /**
   * Query para tarefas concluídas com histórico
   */
  static getTarefasConcluidasComHistoricoQuery(repository: Repository<Tarefas>, usuarioId: number) {
    return repository
      .createQueryBuilder('tarefa')
      .leftJoin('tarefa.historicotarefas', 'historico')
      .select([
        'tarefa.taskId',
        'tarefa.titulo',
        'tarefa.prioridade',
        'tarefa.criadoEm',
        'historico.alteradoEm',
        'historico.statusNovoId',
      ])
      .where('tarefa.usuarioId = :usuarioId', { usuarioId })
      .andWhere('tarefa.statusId = 3') // Tarefas concluídas
      .andWhere('tarefa.criadoEm >= DATE_SUB(NOW(), INTERVAL 90 DAY)')
      .orderBy('tarefa.criadoEm', 'DESC');
  } 

  /**
   * Query para tarefas em andamento
   */
  static getTarefasEmAndamentoQuery(repository: Repository<Tarefas>, usuarioId: number) {
    return repository
      .createQueryBuilder('tarefa')
      .select([
        'tarefa.taskId',
        'tarefa.titulo',
        'tarefa.prioridade',
        'tarefa.criadoEm',
      ])
      .where('tarefa.usuarioId = :usuarioId', { usuarioId })
      .andWhere('tarefa.statusId IN (1, 2)'); // Tarefas em andamento
  }

  /**
   * Query para contar tarefas em um período específico
   */
  static getContarTarefasPorPeriodoQuery(repository: Repository<Tarefas>, usuarioId: number, dataInicio: Date) {
    return repository
      .createQueryBuilder('tarefa')
      .select('COUNT(*)', 'total')
      .where('tarefa.usuarioId = :usuarioId', { usuarioId })
      .andWhere('tarefa.criadoEm >= :dataInicio', { dataInicio });
  }

  /**
   * Query para tarefas por status
   */
  static getTarefasPorStatusQuery(repository: Repository<Tarefas>, usuarioId: number, statusId: number) {
    return repository
      .createQueryBuilder('tarefa')
      .select('COUNT(*)', 'total')
      .where('tarefa.usuarioId = :usuarioId', { usuarioId })
      .andWhere('tarefa.statusId = :statusId', { statusId });
  }
} 