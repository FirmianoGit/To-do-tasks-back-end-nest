import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Tarefas } from 'src/entities/Tarefas';
import { TarefasService } from 'src/tarefas/tarefas.service';
import { Repository } from 'typeorm';

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
      const resultado = await this.tarefaRepository
        .createQueryBuilder('tarefa')
        .select('AVG(tarefa.prioridade)', 'mediaPrioridade') // Calcula a média
        .where('tarefa.usuarioId = :userId', { userId }) // Filtra pelo ID do usuário
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
}
