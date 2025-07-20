import { Controller, Get, Query, Request } from '@nestjs/common';
import { AuthRequest } from 'src/Common/Auth-models/AuthRequest';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /**
   * Lista todas as tarefas do usuário autenticado, com suporte a paginação.
   * 
   * @param page Número da página (padrão: 1)
   * @param limit Quantidade de itens por página (padrão: 10)
   * @param req Requisição autenticada contendo o usuário
   * @returns Lista paginada de tarefas do usuário
   */
  @Get('all-tasks')
  async GetAlltasks(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Request() req: AuthRequest,
  ) {
    // Obtém o ID do usuário autenticado a partir do token JWT
    const usuarioId = req.user.id;

    // Chama o serviço para listar todas as tarefas do usuário, com paginação
    return this.statisticsService.ListarTodasAsTarefas(usuarioId, page, limit);
  }

  /**
   * Calcula a média de prioridade das tarefas do usuário autenticado.
   * 
   * @param req Requisição autenticada contendo o usuário
   * @returns Média da prioridade das tarefas do usuário
   */
  @Get('average')
  async GetAveragePriority(@Request() req: AuthRequest) {
    // Extrai o ID do usuário autenticado
    const usuarioId = req.user.id;

    // Chama o serviço para calcular a média de prioridade das tarefas do usuário
    return this.statisticsService.calcularMediaPrioridade(usuarioId);
  }

  /**
   * Busca as tarefas concluídas recentemente (últimos 7 dias) do usuário autenticado.
   * 
   * @param req Requisição autenticada contendo o usuário
   * @returns Lista de tarefas concluídas nos últimos 7 dias e o total
   */
  @Get('done-tasks')
  async GetDoneTasks(@Request() req: AuthRequest) {
    // Obtém o ID do usuário autenticado
    const usuarioId = req.user.id;

    // Chama o serviço para buscar tarefas concluídas recentemente
    return this.statisticsService.buscarTarefasRecentes(usuarioId);
  }

  /**
   * Análise 1: Produtividade por Usuário
   * Retorna métricas de produtividade do usuário autenticado, incluindo:
   * - Total de tarefas criadas
   * - Total de tarefas concluídas
   * - Taxa de conclusão (%)
   * - Média de prioridade das tarefas
   * - Distribuição das prioridades
   * - Total de tarefas criadas nos últimos 30 dias
   * 
   * @param req Requisição autenticada contendo o usuário
   * @returns Métricas de produtividade do usuário
   */
  @Get('productivity')
  async GetProductivityAnalysis(@Request() req: AuthRequest) {
    const usuarioId = req.user.id;
    return this.statisticsService.analisarProdutividadePorUsuario(usuarioId);
  } 

  /**
   * Análise 3: Análise Temporal
   * Retorna tendências temporais na criação de tarefas do usuário autenticado,
   * permitindo identificar padrões de produtividade ao longo do tempo.
   * 
   * @param req Requisição autenticada contendo o usuário
   * @returns Dados de tendências temporais de criação de tarefas
   */
  @Get('temporal-trends')
  async GetTemporalTrends(@Request() req: AuthRequest) {
    const usuarioId = req.user.id;
    return this.statisticsService.analisarTendenciasTemporais(usuarioId);
  }

  /**
   * Análise 7: Análise Preditiva
   * Retorna previsões baseadas no histórico de tarefas do usuário autenticado,
   * utilizando técnicas de análise preditiva para estimar comportamentos futuros.
   * 
   * @param req Requisição autenticada contendo o usuário
   * @returns Previsões e insights baseados no histórico de tarefas
   */
  @Get('predictive')
  async GetPredictiveAnalysis(@Request() req: AuthRequest) {
    const usuarioId = req.user.id;
    return this.statisticsService.analisePreditiva(usuarioId);
  }
}
