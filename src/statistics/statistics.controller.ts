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
}
