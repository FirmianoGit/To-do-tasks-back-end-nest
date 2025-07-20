import { Controller, Get, Query, Request } from '@nestjs/common';
import { AuthRequest } from 'src/Common/Auth-models/AuthRequest';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('all-tasks')
  async GetAlltasks(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Request() req: AuthRequest,
  ) {
    // Obtém o ID do usuário autenticado
    const usuarioId = req.user.id;

    return this.statisticsService.ListarTodasAsTarefas(usuarioId, page, limit);
  }

  @Get('average')
  async GetAveragePriority(@Request() req: AuthRequest) {
    const usuarioId = req.user.id;
    return this.statisticsService.calcularMediaPrioridade(usuarioId);
  }

  @Get('done-tasks')
  async GetDoneTasks(@Request() req: AuthRequest) {
    const usuarioId = req.user.id;
    return this.statisticsService.buscarTarefasRecentes(usuarioId);
  }

  /**
   * Análise 1: Produtividade por Usuário
   * Retorna métricas de produtividade do usuário autenticado
   */
  @Get('productivity')
  async GetProductivityAnalysis(@Request() req: AuthRequest) {
    const usuarioId = req.user.id;
    return this.statisticsService.analisarProdutividadePorUsuario(usuarioId);
  }

  /**
   * Análise 3: Análise Temporal
   * Retorna tendências temporais na criação de tarefas
   */
  @Get('temporal-trends')
  async GetTemporalTrends(@Request() req: AuthRequest) {
    const usuarioId = req.user.id;
    return this.statisticsService.analisarTendenciasTemporais(usuarioId);
  }

  /**
   * Análise 7: Análise Preditiva
   * Retorna previsões baseadas no histórico de tarefas
   */
  @Get('predictive')
  async GetPredictiveAnalysis(@Request() req: AuthRequest) {
    const usuarioId = req.user.id;
    return this.statisticsService.analisePreditiva(usuarioId);
  }
}
