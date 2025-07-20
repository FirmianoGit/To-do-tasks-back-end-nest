import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Tarefas } from 'src/entities/Tarefas';
import { TarefasService } from 'src/tarefas/tarefas.service';
import { Repository } from 'typeorm';
import { StatisticsQueries } from './queries/statistics.queries';

@Injectable()
export class StatisticsService {
  constructor(
    @Inject('TAREFAS_REPOSITORY')
    private readonly tarefaRepository: Repository<Tarefas>,
    private readonly tarefaService: TarefasService,
  ) {}
  async ListarTodasAsTarefas(
    usuarioId: number,
    page: number,
    limit: number,
  ): Promise<any> {
    try {
      // Validação dos parâmetros
      if (!usuarioId || usuarioId <= 0) {
        throw new BadRequestException('ID do usuário é inválido.');
      }
      if (page < 1 || limit < 1) {
        throw new BadRequestException('Parâmetros de paginação são inválidos.');
      }

      // Chamando o serviço para buscar as tarefas
      const TodasAsTarefas = await this.tarefaService.findAllByUserId(
        usuarioId,
        page,
        limit,
      );

      // Verifica se há resultados
      if (!TodasAsTarefas) {
        return {
          message: 'Nenhuma tarefa encontrada para o usuário informado.',
          data: [],
        };
      }

      return {
        message: 'Tarefas recuperadas com sucesso.',
        data: TodasAsTarefas,
      };
    } catch (error) {
      // Log de erro para depuração (opcional)
      console.error('Erro ao listar todas as tarefas:', error);

      // Lança uma exceção apropriada
      throw new InternalServerErrorException(
        error.message || 'Erro ao recuperar as tarefas.',
      );
    }
  }

  async calcularMediaPrioridade(userId: number): Promise<any> {
    try {
      // Query para calcular a média diretamente no banco de dados
      const resultado = await StatisticsQueries
        .getMediaPrioridadeQuery(this.tarefaRepository, userId)
        .andWhere('tarefa.statusId = :statusId', { statusId: 1 }) // Filtra por statusId = 1
        .getRawOne(); // Obtém o resultado cru da query

      // Converte o resultado para número, ou retorna 0 se for nulo
      const mediaPrioridade = parseFloat(resultado.mediaPrioridade) || 0;
      return {
        message: 'Média de prioridade calculada com sucesso.',
        data: { mediaPrioridade },
      };
    } catch (error) {
      console.error('Erro ao calcular a média de prioridade:', error);
      throw new InternalServerErrorException(
        'Erro ao calcular a média de prioridade.',
      );
    }
  }
  async buscarTarefasRecentes(
    idUsuario: number,
  ): Promise<{ tarefas: Tarefas[]; totalTarefas: number }> {
    try {
      // Data limite para os últimos 7 dias
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

      // Query para buscar as tarefas criadas nos últimos 7 dias com statusId = 3
      const [tarefas, totalTarefas] = await this.tarefaRepository
        .createQueryBuilder('tarefa')
        .where('tarefa.usuarioId = :idUsuario', { idUsuario }) // Filtra pelo ID do usuário
        .andWhere('tarefa.criadoEm >= :seteDiasAtras', { seteDiasAtras }) // Filtra por data
        .andWhere('tarefa.statusId = :statusId', { statusId: 3 }) // Filtra por statusId = 3
        .orderBy('tarefa.criadoEm', 'DESC') // Ordena por data de criação, mais recente primeiro
        .getManyAndCount(); // Retorna as tarefas e o total de tarefas

      return {
        tarefas,
        totalTarefas, // Soma das tarefas retornadas
      };
    } catch (erro) {
      console.error('Erro ao buscar tarefas recentes:', erro);
      throw new InternalServerErrorException(
        'Erro ao buscar tarefas criadas recentemente.',
      );
    }
  }

  /* Calcula métricas de produtividade para um usuário específico*/
  async analisarProdutividadePorUsuario(usuarioId: number): Promise<any> {
    try {
      if (!usuarioId || usuarioId <= 0) {
        throw new BadRequestException('ID do usuário é inválido.');
      }

      // Total de tarefas criadas pelo usuário
      const totalTarefas = await this.tarefaRepository.count({
        where: { usuarioId },
      });

      // Tarefas concluídas (statusId = 3)
      const tarefasConcluidas = await this.tarefaRepository.count({
        where: { usuarioId, statusId: 3 },
      });

      // Taxa de conclusão
      const taxaConclusao = totalTarefas > 0 ? (tarefasConcluidas / totalTarefas) * 100 : 0;

      // Média de prioridade das tarefas
      const mediaPrioridade = await StatisticsQueries
        .getMediaPrioridadeQuery(this.tarefaRepository, usuarioId)
        .getRawOne();

      // Distribuição de prioridades
      const distribuicaoPrioridades = await StatisticsQueries
        .getDistribuicaoPrioridadesQuery(this.tarefaRepository, usuarioId)
        .getRawMany();

      // Tarefas criadas nos últimos 30 dias
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
      
      const tarefasUltimos30Dias = await this.tarefaRepository.count({
        where: {
          usuarioId,
          criadoEm: trintaDiasAtras,
        },
      });

      return {
        message: 'Análise de produtividade calculada com sucesso.',
        data: {
          totalTarefas,
          tarefasConcluidas,
          taxaConclusao: Math.round(taxaConclusao * 100) / 100,
          mediaPrioridade: parseFloat(mediaPrioridade.media) || 0,
          distribuicaoPrioridades,
          tarefasUltimos30Dias,
        },
      };
    } catch (error) {
      console.error('Erro ao analisar produtividade:', error);
      throw new InternalServerErrorException(
        'Erro ao calcular análise de produtividade.',
      );
    }
  }

  /**
   * Análise 3: Análise Temporal
   * Analisa tendências temporais na criação de tarefas
   */
  async analisarTendenciasTemporais(usuarioId: number): Promise<any> {
    try {
      if (!usuarioId || usuarioId <= 0) {
        throw new BadRequestException('ID do usuário é inválido.');
      }

      // Tarefas por dia da semana
      const tarefasPorDiaSemana = await StatisticsQueries
        .getTarefasPorDiaSemanaQuery(this.tarefaRepository, usuarioId)
        .getRawMany();

      // Tarefas por hora do dia
      const tarefasPorHora = await StatisticsQueries
        .getTarefasPorHoraQuery(this.tarefaRepository, usuarioId)
        .getRawMany();

      // Tarefas por semana (últimas 12 semanas)
      const tarefasPorSemana = await StatisticsQueries
        .getTarefasPorSemanaQuery(this.tarefaRepository, usuarioId)
        .getRawMany();

      // Tendência de crescimento (comparação com período anterior)
      const agora = new Date();
      const trintaDiasAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sessentaDiasAtras = new Date(agora.getTime() - 60 * 24 * 60 * 60 * 1000);

      const tarefasPeriodoAtual = await this.tarefaRepository.count({
        where: {
          usuarioId,
          criadoEm: trintaDiasAtras,
        },
      });

      const tarefasPeriodoAnterior = await this.tarefaRepository.count({
        where: {
          usuarioId,
          criadoEm: sessentaDiasAtras,
        },
      });

      const crescimento = tarefasPeriodoAnterior > 0 
        ? ((tarefasPeriodoAtual - tarefasPeriodoAnterior) / tarefasPeriodoAnterior) * 100 
        : 0;

      return {
        message: 'Análise temporal calculada com sucesso.',
        data: {
          tarefasPorDiaSemana,
          tarefasPorHora,
          tarefasPorSemana,
          crescimento: Math.round(crescimento * 100) / 100,
          periodoAtual: tarefasPeriodoAtual,
          periodoAnterior: tarefasPeriodoAnterior,
        },
      };
    } catch (error) {
      console.error('Erro ao analisar tendências temporais:', error);
      throw new InternalServerErrorException(
        'Erro ao calcular análise temporal.',
      );
    }
  }

  /**
   * Análise 7: Análise Preditiva
   * Prevê tempo de conclusão baseado em histórico
   */
  async analisePreditiva(usuarioId: number): Promise<any> {
    try {
      if (!usuarioId || usuarioId <= 0) {
        throw new BadRequestException('ID do usuário é inválido.');
      }

      // Busca tarefas concluídas com histórico de mudanças de status
      const tarefasConcluidas = await StatisticsQueries
        .getTarefasConcluidasComHistoricoQuery(this.tarefaRepository, usuarioId)
        .getMany();

      // Calcula tempo médio de conclusão por prioridade
      const tempoPorPrioridade = {};
      const tarefasPorPrioridade = {};

      tarefasConcluidas.forEach(tarefa => {
        const prioridade = tarefa.prioridade;
        if (!tempoPorPrioridade[prioridade]) {
          tempoPorPrioridade[prioridade] = [];
          tarefasPorPrioridade[prioridade] = 0;
        }
        tarefasPorPrioridade[prioridade]++;

        // Calcula tempo de conclusão se houver histórico
        if (tarefa.historicotarefas && tarefa.historicotarefas.length > 0) {
          const tempoConclusao = tarefa.historicotarefas[0].alteradoEm.getTime() - tarefa.criadoEm.getTime();
          tempoPorPrioridade[prioridade].push(tempoConclusao / (1000 * 60 * 60 * 24)); // Converte para dias
        }
      });

      // Calcula médias
      const mediasTempo = {};
      Object.keys(tempoPorPrioridade).forEach(prioridade => {
        const tempos = tempoPorPrioridade[prioridade];
        if (tempos.length > 0) {
          const media = tempos.reduce((a, b) => a + b, 0) / tempos.length;
          mediasTempo[prioridade] = Math.round(media * 100) / 100;
        }
      });

      // Identifica tarefas com risco de atraso
      const tarefasEmAndamento = await StatisticsQueries
        .getTarefasEmAndamentoQuery(this.tarefaRepository, usuarioId)
        .getMany();

      const tarefasComRisco = tarefasEmAndamento.map(tarefa => {
        const tempoDecorrido = (new Date().getTime() - tarefa.criadoEm.getTime()) / (1000 * 60 * 60 * 24);
        const tempoMedioEsperado = mediasTempo[tarefa.prioridade] || 7; // Padrão de 7 dias
        const risco = tempoDecorrido > tempoMedioEsperado * 1.5; // 50% acima da média

        return {
          taskId: tarefa.taskId,
          titulo: tarefa.titulo,
          prioridade: tarefa.prioridade,
          tempoDecorrido: Math.round(tempoDecorrido * 100) / 100,
          tempoMedioEsperado,
          risco,
        };
      });

      return {
        message: 'Análise preditiva calculada com sucesso.',
        data: {
          mediasTempoPorPrioridade: mediasTempo,
          tarefasPorPrioridade,
          tarefasComRiscoDeAtraso: tarefasComRisco.filter(t => t.risco),
          totalTarefasAnalisadas: tarefasConcluidas.length,
        },
      };
    } catch (error) {
      console.error('Erro ao realizar análise preditiva:', error);
      throw new InternalServerErrorException(
        'Erro ao calcular análise preditiva.',
      );
    }
  }
}
