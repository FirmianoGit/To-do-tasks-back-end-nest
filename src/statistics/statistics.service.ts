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
  ) { }

  /**
   * Lista todas as tarefas de um usuário com paginação.
   * @param usuarioId ID do usuário
   * @param page Página atual
   * @param limit Limite de itens por página
   * @returns Lista de tarefas e mensagem
   */
  async ListarTodasAsTarefas(
    usuarioId: number,
    page: number,
    limit: number,
  ): Promise<any> {
    try {
      // Validação dos parâmetros de entrada
      if (!usuarioId || usuarioId <= 0) {
        throw new BadRequestException('ID do usuário é inválido.');
      }
      if (page < 1 || limit < 1) {
        throw new BadRequestException('Parâmetros de paginação são inválidos.');
      }

      // Busca todas as tarefas do usuário usando o serviço de tarefas
      const TodasAsTarefas = await this.tarefaService.findAllByUserId(
        usuarioId,
        page,
        limit,
      );

      // Caso não encontre tarefas, retorna mensagem apropriada
      if (!TodasAsTarefas) {
        return {
          message: 'Nenhuma tarefa encontrada para o usuário informado.',
          data: [],
        };
      }

      // Retorna as tarefas encontradas
      return {
        message: 'Tarefas recuperadas com sucesso.',
        data: TodasAsTarefas,
      };
    } catch (error) {
      // Log detalhado do erro
      console.error('Erro ao listar todas as tarefas:', {
        mensagem: error.message,
        stack: error.stack,
        parametros: { usuarioId, page, limit },
        tipoErro: error.name,
      });

      // Lança exceção interna com detalhes
      throw new InternalServerErrorException({
        mensagem: 'Erro ao recuperar as tarefas.',
        detalhes: error.message,
        stack: error.stack,
        parametros: { usuarioId, page, limit },
        tipoErro: error.name,
      });
    }
  }

  /**
   * Calcula a média de prioridade das tarefas em aberto (statusId = 1) de um usuário.
   * @param userId ID do usuário
   * @returns Média de prioridade
   */
  async calcularMediaPrioridade(userId: number): Promise<any> {
    try {
      // Validação do ID do usuário
      if (!userId || userId <= 0) {
        throw new BadRequestException('ID do usuário é inválido.');
      }

      // Executa a query para obter a média de prioridade das tarefas em aberto
      const resultado = await StatisticsQueries
        .getMediaPrioridadeQuery(this.tarefaRepository, userId)
        .andWhere('tarefa.statusId = :statusId', { statusId: 1 })
        .getRawOne();

      let media: any = null;

      // Tenta encontrar o campo correto da média no resultado
      if (resultado) {
        if (resultado.media !== undefined) {
          media = resultado.media;
        } else if (resultado.mediaPrioridade !== undefined) {
          media = resultado.mediaPrioridade;
        } else {
          // Procura por qualquer campo que contenha 'media' no nome
          const chaveMedia = Object.keys(resultado).find(
            (k) => k.toLowerCase().includes('media')
          );
          if (chaveMedia) {
            media = resultado[chaveMedia];
          }
        }
      }

      // Converte o valor encontrado para número, se possível
      let mediaPrioridade = 0;
      if (media !== null && media !== undefined && media !== '') {
        mediaPrioridade = Number(media);
        if (isNaN(mediaPrioridade)) {
          mediaPrioridade = 0;
        }
      }

      // Retorna a média calculada
      return {
        message: 'Média de prioridade calculada com sucesso.',
        data: { mediaPrioridade },
      };
    } catch (error) {
      // Log detalhado do erro
      console.error('Erro ao calcular a média de prioridade:', {
        mensagem: error.message,
        stack: error.stack,
        parametros: { userId },
        tipoErro: error.name,
      });
      // Lança exceção interna com detalhes
      throw new InternalServerErrorException({
        mensagem: 'Erro ao calcular a média de prioridade.',
        detalhes: error.message,
        stack: error.stack,
        parametros: { userId },
        tipoErro: error.name,
      });
    }
  }

  /**
   * Busca tarefas concluídas (statusId = 3) criadas nos últimos 7 dias para um usuário.
   * @param idUsuario ID do usuário
   * @returns Lista de tarefas e total
   */
  async buscarTarefasRecentes(
    idUsuario: number,
  ): Promise<{ tarefas: Tarefas[]; totalTarefas: number }> {
    try {
      // Validação do ID do usuário
      if (!idUsuario || idUsuario <= 0) {
        throw new BadRequestException('ID do usuário é inválido.');
      }

      // Calcula a data de 7 dias atrás
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

      // Busca tarefas concluídas criadas nos últimos 7 dias
      const [tarefas, totalTarefas] = await this.tarefaRepository
        .createQueryBuilder('tarefa')
        .where('tarefa.usuarioId = :idUsuario', { idUsuario })
        .andWhere('tarefa.criadoEm >= :seteDiasAtras', { seteDiasAtras })
        .andWhere('tarefa.statusId = :statusId', { statusId: 3 })
        .orderBy('tarefa.criadoEm', 'DESC')
        .getManyAndCount();

      // Retorna as tarefas encontradas e o total
      return {
        tarefas,
        totalTarefas,
      };
    } catch (erro) {
      // Log detalhado do erro
      console.error('Erro ao buscar tarefas recentes:', {
        mensagem: erro.message,
        stack: erro.stack,
        parametros: { idUsuario },
        tipoErro: erro.name,
      });
      // Lança exceção interna com detalhes
      throw new InternalServerErrorException({
        mensagem: 'Erro ao buscar tarefas criadas recentemente.',
        detalhes: erro.message,
        stack: erro.stack,
        parametros: { idUsuario },
        tipoErro: erro.name,
      });
    }
  }

  /**
   * Analisa a produtividade de um usuário, incluindo total de tarefas, concluídas, taxa de conclusão, média de prioridade, distribuição de prioridades e tarefas criadas nos últimos 30 dias.
   * @param usuarioId ID do usuário
   * @returns Dados de produtividade
   */
  async analisarProdutividadePorUsuario(usuarioId: number): Promise<any> {
    try {
      // Validação do ID do usuário
      if (!usuarioId || usuarioId <= 0) {
        throw new BadRequestException('ID do usuário é inválido.');
      }

      // Conta o total de tarefas criadas pelo usuário
      const totalTarefas = await this.tarefaRepository.count({
        where: { usuarioId },
      });

      // Conta o total de tarefas concluídas (statusId = 3)
      const tarefasConcluidas = await this.tarefaRepository.count({
        where: { usuarioId, statusId: 3 },
      });

      // Calcula a taxa de conclusão em porcentagem
      const taxaConclusao = totalTarefas > 0 ? (tarefasConcluidas / totalTarefas) * 100 : 0;

      // Busca a média de prioridade das tarefas
      const mediaPrioridade = await StatisticsQueries
        .getMediaPrioridadeQuery(this.tarefaRepository, usuarioId)
        .getRawOne();

      // Busca a distribuição de prioridades das tarefas
      const distribuicaoPrioridades = await StatisticsQueries
        .getDistribuicaoPrioridadesQuery(this.tarefaRepository, usuarioId)
        .getRawMany();

      // Calcula a data de 30 dias atrás
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

      // Conta as tarefas criadas nos últimos 30 dias
      const tarefasUltimos30Dias = await this.tarefaRepository.count({
        where: {
          usuarioId,
          criadoEm: trintaDiasAtras,
        },
      });

      // Validação extra para garantir que não há valores negativos
      if (totalTarefas < 0 || tarefasConcluidas < 0) {
        throw new InternalServerErrorException('Valores negativos encontrados nas contagens de tarefas.');
      }

      // Retorna os dados de produtividade
      return {
        message: 'Análise de produtividade calculada com sucesso.',
        data: {
          totalTarefas,
          tarefasConcluidas,
          taxaConclusao: Math.round(taxaConclusao * 100) / 100,
          mediaPrioridade: parseFloat(mediaPrioridade?.media) || 0,
          distribuicaoPrioridades,
          tarefasUltimos30Dias,
        },
      };
    } catch (error) {
      // Log detalhado do erro
      console.error('Erro ao analisar produtividade:', {
        mensagem: error.message,
        stack: error.stack,
        parametros: { usuarioId },
        tipoErro: error.name,
      });
      // Lança exceção interna com detalhes
      throw new InternalServerErrorException({
        mensagem: 'Erro ao calcular análise de produtividade.',
        detalhes: error.message,
        stack: error.stack,
        parametros: { usuarioId },
        tipoErro: error.name,
      });
    }
  }

  /**
   * Analisa tendências temporais das tarefas de um usuário, como tarefas por dia da semana, por hora, por semana e crescimento no período.
   * @param usuarioId ID do usuário
   * @returns Dados de tendências temporais
   */
  async analisarTendenciasTemporais(usuarioId: number): Promise<any> {
    try {
      // Validação do ID do usuário
      if (!usuarioId || usuarioId <= 0) {
        throw new BadRequestException('ID do usuário é inválido.');
      }

      // Busca quantidade de tarefas por dia da semana
      const tarefasPorDiaSemana = await StatisticsQueries
        .getTarefasPorDiaSemanaQuery(this.tarefaRepository, usuarioId)
        .getRawMany();

      // Busca quantidade de tarefas por hora do dia
      const tarefasPorHora = await StatisticsQueries
        .getTarefasPorHoraQuery(this.tarefaRepository, usuarioId)
        .getRawMany();

      // Busca quantidade de tarefas por semana
      const tarefasPorSemana = await StatisticsQueries
        .getTarefasPorSemanaQuery(this.tarefaRepository, usuarioId)
        .getRawMany();

      // Define datas para os períodos de comparação (30 e 60 dias atrás)
      const agora = new Date();
      const trintaDiasAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sessentaDiasAtras = new Date(agora.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Conta tarefas criadas nos últimos 30 dias
      const tarefasPeriodoAtual = await this.tarefaRepository.count({
        where: {
          usuarioId,
          criadoEm: trintaDiasAtras,
        },
      });

      // Conta tarefas criadas entre 30 e 60 dias atrás
      const tarefasPeriodoAnterior = await this.tarefaRepository.count({
        where: {
          usuarioId,
          criadoEm: sessentaDiasAtras,
        },
      });

      // Validação extra para garantir que não há valores negativos
      if (tarefasPeriodoAtual < 0 || tarefasPeriodoAnterior < 0) {
        throw new InternalServerErrorException('Valores negativos encontrados nas contagens de tarefas por período.');
      }

      // Calcula o crescimento percentual entre os períodos
      const crescimento = tarefasPeriodoAnterior > 0
        ? ((tarefasPeriodoAtual - tarefasPeriodoAnterior) / tarefasPeriodoAnterior) * 100
        : 0;

      // Retorna os dados de tendências temporais
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
      // Log detalhado do erro
      console.error('Erro ao analisar tendências temporais:', {
        mensagem: error.message,
        stack: error.stack,
        parametros: { usuarioId },
        tipoErro: error.name,
      });
      // Lança exceção interna com detalhes
      throw new InternalServerErrorException({
        mensagem: 'Erro ao calcular análise temporal.',
        detalhes: error.message,
        stack: error.stack,
        parametros: { usuarioId },
        tipoErro: error.name,
      });
    }
  }

  /**
   * Realiza análise preditiva para identificar tarefas em risco de atraso, com base no histórico de conclusão por prioridade.
   * @param usuarioId ID do usuário
   * @returns Dados de análise preditiva
   */
  async analisePreditiva(usuarioId: number): Promise<any> {
    try {
      // Validação do ID do usuário
      if (!usuarioId || usuarioId <= 0) {
        throw new BadRequestException('ID do usuário é inválido.');
      }

      // Busca tarefas concluídas com histórico para o usuário
      const tarefasConcluidas = await StatisticsQueries
        .getTarefasConcluidasComHistoricoQuery(this.tarefaRepository, usuarioId)
        .getMany();

      // Garante que o resultado é um array
      if (!Array.isArray(tarefasConcluidas)) {
        throw new InternalServerErrorException('O resultado de tarefas concluídas não é um array.');
      }

      // Objetos para armazenar tempos e contagens por prioridade
      const tempoPorPrioridade = {};
      const tarefasPorPrioridade = {};

      // Calcula o tempo de conclusão para cada prioridade
      tarefasConcluidas.forEach(tarefa => {
        const prioridade = tarefa.prioridade;
        if (!tempoPorPrioridade[prioridade]) {
          tempoPorPrioridade[prioridade] = [];
          tarefasPorPrioridade[prioridade] = 0;
        }
        tarefasPorPrioridade[prioridade]++;

        // Calcula o tempo de conclusão em dias, se houver histórico
        if (tarefa.historicotarefas && tarefa.historicotarefas.length > 0) {
          const tempoConclusao = tarefa.historicotarefas[0].alteradoEm.getTime() - tarefa.criadoEm.getTime();
          tempoPorPrioridade[prioridade].push(tempoConclusao / (1000 * 60 * 60 * 24));
        }
      });

      // Calcula a média de tempo de conclusão por prioridade
      const mediasTempo = {};
      Object.keys(tempoPorPrioridade).forEach(prioridade => {
        const tempos = tempoPorPrioridade[prioridade];
        if (tempos.length > 0) {
          const media = tempos.reduce((a, b) => a + b, 0) / tempos.length;
          mediasTempo[prioridade] = Math.round(media * 100) / 100;
        }
      });

      // Busca tarefas em andamento para o usuário
      const tarefasEmAndamento = await StatisticsQueries
        .getTarefasEmAndamentoQuery(this.tarefaRepository, usuarioId)
        .getMany();

      // Garante que o resultado é um array
      if (!Array.isArray(tarefasEmAndamento)) {
        throw new InternalServerErrorException('O resultado de tarefas em andamento não é um array.');
      }

      // Identifica tarefas em risco de atraso
      const tarefasComRisco = tarefasEmAndamento.map(tarefa => {
        // Calcula o tempo decorrido desde a criação em dias
        const tempoDecorrido = (new Date().getTime() - tarefa.criadoEm.getTime()) / (1000 * 60 * 60 * 24);
        // Usa a média de tempo esperada para a prioridade, ou 7 dias como padrão
        const tempoMedioEsperado = mediasTempo[tarefa.prioridade] || 7;
        // Considera risco se o tempo decorrido for 50% maior que a média
        const risco = tempoDecorrido > tempoMedioEsperado * 1.5;

        return {
          taskId: tarefa.taskId,
          titulo: tarefa.titulo,
          prioridade: tarefa.prioridade,
          tempoDecorrido: Math.round(tempoDecorrido * 100) / 100,
          tempoMedioEsperado,
          risco,
        };
      });

      // Retorna os dados da análise preditiva
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
      // Log detalhado do erro
      console.error('Erro ao realizar análise preditiva:', {
        mensagem: error.message,
        stack: error.stack,
        parametros: { usuarioId },
        tipoErro: error.name,
      });
      // Lança exceção interna com detalhes
      throw new InternalServerErrorException({
        mensagem: 'Erro ao calcular análise preditiva.',
        detalhes: error.message,
        stack: error.stack,
        parametros: { usuarioId },
        tipoErro: error.name,
      });
    }
  }
}
