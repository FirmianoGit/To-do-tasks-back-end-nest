import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatisticsService } from './statistics.service';
import { TarefasService } from '../tarefas/tarefas.service';
import { Tarefas } from '../entities/Tarefas';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

/**
 * Testes unitários para o serviço de estatísticas (StatisticsService).
 * 
 * Cada bloco de teste (describe/it) está comentado para facilitar o entendimento dos casos cobertos.
 */
describe('StatisticsService', () => {
  let service: StatisticsService;
  let tarefaRepository: Repository<Tarefas>;
  let tarefaService: TarefasService;

  // Mock de uma tarefa para ser reutilizado nos testes
  const mockTarefa = {
    taskId: 1,
    titulo: 'Tarefa Teste',
    descricao: 'Descrição da tarefa',
    prioridade: 2,
    statusId: 1,
    usuarioId: 1,
    criadoEm: new Date(),
    alteradoEm: new Date(),
  };

  // Lista de tarefas mock para simular retornos de consultas
  const mockTarefasList = [
    { ...mockTarefa, taskId: 1 },
    { ...mockTarefa, taskId: 2, statusId: 3 },
    { ...mockTarefa, taskId: 3, prioridade: 3 },
  ];

  // Função auxiliar para criar um mock de QueryBuilder do TypeORM
  const createMockQueryBuilder = () => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    having: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    getCount: jest.fn(),
  });

  // Mock do repositório de tarefas
  const mockRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => createMockQueryBuilder()),
  };

  // Mock do serviço de tarefas
  const mockTarefaService = {
    findAllByUserId: jest.fn(),
  };

  // Configuração do módulo de teste antes de cada teste
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: 'TAREFAS_REPOSITORY',
          useValue: mockRepository,
        },
        {
          provide: TarefasService,
          useValue: mockTarefaService,
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    tarefaRepository = module.get<Repository<Tarefas>>('TAREFAS_REPOSITORY');
    tarefaService = module.get<TarefasService>(TarefasService);
  });

  // Limpa os mocks após cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Testes para o método ListarTodasAsTarefas
   * - Verifica se retorna todas as tarefas corretamente
   * - Verifica retorno quando não há tarefas
   * - Verifica tratamento de parâmetros inválidos
   * - Verifica tratamento de erro interno
   */
  describe('ListarTodasAsTarefas', () => {
    it('deve listar todas as tarefas com sucesso', async () => {
      // Caso de sucesso: retorna lista de tarefas e total
      const usuarioId = 1;
      const page = 1;
      const limit = 10;
      const mockResult = { tasks: mockTarefasList, total: 3 };

      mockTarefaService.findAllByUserId.mockResolvedValue(mockResult);

      const result = await service.ListarTodasAsTarefas(usuarioId, page, limit);

      expect(mockTarefaService.findAllByUserId).toHaveBeenCalledWith(usuarioId, page, limit);
      expect(result).toEqual({
        message: 'Tarefas recuperadas com sucesso.',
        data: mockResult,
      });
    });

    it('deve retornar mensagem quando nenhuma tarefa for encontrada', async () => {
      // Caso: nenhum resultado encontrado
      const usuarioId = 1;
      const page = 1;
      const limit = 10;

      mockTarefaService.findAllByUserId.mockResolvedValue(null);

      const result = await service.ListarTodasAsTarefas(usuarioId, page, limit);

      expect(result).toEqual({
        message: 'Nenhuma tarefa encontrada para o usuário informado.',
        data: [],
      });
    });

    it('deve lançar InternalServerErrorException para ID de usuário inválido', async () => {
      // Caso: usuárioId inválido (0)
      const usuarioId = 0;
      const page = 1;
      const limit = 10;

      await expect(service.ListarTodasAsTarefas(usuarioId, page, limit))
        .rejects.toThrow(InternalServerErrorException);
    });

    it('deve lançar InternalServerErrorException para parâmetros de paginação inválidos', async () => {
      // Caso: página inválida (0)
      const usuarioId = 1;
      const page = 0;
      const limit = 10;

      await expect(service.ListarTodasAsTarefas(usuarioId, page, limit))
        .rejects.toThrow(InternalServerErrorException);
    });

    it('deve lançar InternalServerErrorException em caso de erro', async () => {
      // Caso: erro inesperado do serviço
      const usuarioId = 1;
      const page = 1;
      const limit = 10;

      mockTarefaService.findAllByUserId.mockRejectedValue(new Error('Erro de banco'));

      await expect(service.ListarTodasAsTarefas(usuarioId, page, limit))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  /**
   * Testes para o método calcularMediaPrioridade
   * - Verifica cálculo correto da média
   * - Verifica retorno 0 quando não há dados
   * - Verifica tratamento de erro interno
   */
  describe('calcularMediaPrioridade', () => {
    it('deve calcular a média de prioridade com sucesso', async () => {
      // Caso de sucesso: retorna média calculada
      const userId = 1;
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawOne.mockResolvedValue({ mediaPrioridade: '2.5' });

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.calcularMediaPrioridade(userId);

      expect(result).toEqual({
        message: 'Média de prioridade calculada com sucesso.',
        data: { mediaPrioridade: 2.5 },
      });
    });

    it('deve retornar 0 quando não há dados', async () => {
      // Caso: nenhuma tarefa encontrada, retorna média 0
      const userId = 1;
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawOne.mockResolvedValue({ mediaPrioridade: null });

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.calcularMediaPrioridade(userId);

      expect(result).toEqual({
        message: 'Média de prioridade calculada com sucesso.',
        data: { mediaPrioridade: 0 },
      });
    });

    it('deve lançar InternalServerErrorException em caso de erro', async () => {
      // Caso: erro inesperado ao calcular média
      const userId = 1;
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawOne.mockRejectedValue(new Error('Erro de banco'));

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.calcularMediaPrioridade(userId))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  /**
   * Testes para o método buscarTarefasRecentes
   * - Verifica busca de tarefas recentes
   * - Verifica tratamento de erro interno
   */
  describe('buscarTarefasRecentes', () => {
    it('deve buscar tarefas recentes com sucesso', async () => {
      // Caso de sucesso: retorna tarefas recentes e total
      const idUsuario = 1;
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockTarefasList, 3]);

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.buscarTarefasRecentes(idUsuario);

      expect(result).toEqual({
        tarefas: mockTarefasList,
        totalTarefas: 3,
      });
    });

    it('deve lançar InternalServerErrorException em caso de erro', async () => {
      // Caso: erro inesperado ao buscar tarefas recentes
      const idUsuario = 1;
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getManyAndCount.mockRejectedValue(new Error('Erro de banco'));

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.buscarTarefasRecentes(idUsuario))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  /**
   * Testes para o método analisarProdutividadePorUsuario
   * - Verifica análise de produtividade completa
   * - Verifica tratamento de usuário inválido
   * - Verifica taxa de conclusão 0 quando não há tarefas
   * - Verifica tratamento de erro interno
   */
  describe('analisarProdutividadePorUsuario', () => {
    it('deve analisar produtividade com sucesso', async () => {
      // Caso de sucesso: retorna análise de produtividade detalhada
      const usuarioId = 1;
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawOne.mockResolvedValue({ media: '2.5' });
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { prioridade: 1, quantidade: 5 },
        { prioridade: 2, quantidade: 3 },
      ]);

      mockRepository.count
        .mockResolvedValueOnce(10) // totalTarefas
        .mockResolvedValueOnce(7)  // tarefasConcluidas
        .mockResolvedValueOnce(3); // tarefasUltimos30Dias

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.analisarProdutividadePorUsuario(usuarioId);

      expect(result).toEqual({
        message: 'Análise de produtividade calculada com sucesso.',
        data: {
          totalTarefas: 10,
          tarefasConcluidas: 7,
          taxaConclusao: 70,
          mediaPrioridade: 2.5,
          distribuicaoPrioridades: [
            { prioridade: 1, quantidade: 5 },
            { prioridade: 2, quantidade: 3 },
          ],
          tarefasUltimos30Dias: 3,
        },
      });
    });

    it('deve lançar InternalServerErrorException para ID de usuário inválido', async () => {
      // Caso: usuárioId inválido (0)
      const usuarioId = 0;

      await expect(service.analisarProdutividadePorUsuario(usuarioId))
        .rejects.toThrow(InternalServerErrorException);
    });

    it('deve calcular taxa de conclusão como 0 quando não há tarefas', async () => {
      // Caso: nenhum dado, taxa de conclusão deve ser 0
      const usuarioId = 1;
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawOne.mockResolvedValue({ media: '0' });
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      mockRepository.count
        .mockResolvedValueOnce(0) // totalTarefas
        .mockResolvedValueOnce(0) // tarefasConcluidas
        .mockResolvedValueOnce(0); // tarefasUltimos30Dias

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.analisarProdutividadePorUsuario(usuarioId);

      expect(result.data.taxaConclusao).toBe(0);
    });

    it('deve lançar InternalServerErrorException em caso de erro', async () => {
      // Caso: erro inesperado ao analisar produtividade
      const usuarioId = 1;

      mockRepository.count.mockRejectedValue(new Error('Erro de banco'));

      await expect(service.analisarProdutividadePorUsuario(usuarioId))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  /**
   * Testes para o método analisarTendenciasTemporais
   * - Verifica análise temporal completa
   * - Verifica tratamento de usuário inválido
   * - Verifica crescimento 0 quando não há tarefas no período anterior
   * - Verifica tratamento de erro interno
   */
  describe('analisarTendenciasTemporais', () => {
    it('deve analisar tendências temporais com sucesso', async () => {
      // Caso de sucesso: retorna análise temporal detalhada
      const usuarioId = 1;
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([{ dia: 'Segunda', quantidade: 5 }]) // tarefasPorDiaSemana
        .mockResolvedValueOnce([{ hora: 9, quantidade: 3 }]) // tarefasPorHora
        .mockResolvedValueOnce([{ semana: '2024-01', quantidade: 10 }]); // tarefasPorSemana

      mockRepository.count
        .mockResolvedValueOnce(15) // tarefasPeriodoAtual
        .mockResolvedValueOnce(10); // tarefasPeriodoAnterior

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.analisarTendenciasTemporais(usuarioId);

      expect(result).toEqual({
        message: 'Análise temporal calculada com sucesso.',
        data: {
          tarefasPorDiaSemana: [{ dia: 'Segunda', quantidade: 5 }],
          tarefasPorHora: [{ hora: 9, quantidade: 3 }],
          tarefasPorSemana: [{ semana: '2024-01', quantidade: 10 }],
          crescimento: 50,
          periodoAtual: 15,
          periodoAnterior: 10,
        },
      });
    });

    it('deve lançar InternalServerErrorException para ID de usuário inválido', async () => {
      // Caso: usuárioId inválido (0)
      const usuarioId = 0;

      await expect(service.analisarTendenciasTemporais(usuarioId))
        .rejects.toThrow(InternalServerErrorException);
    });

    it('deve calcular crescimento como 0 quando não há tarefas no período anterior', async () => {
      // Caso: não há tarefas no período anterior, crescimento deve ser 0
      const usuarioId = 1;
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      mockRepository.count
        .mockResolvedValueOnce(5) // tarefasPeriodoAtual
        .mockResolvedValueOnce(0); // tarefasPeriodoAnterior

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.analisarTendenciasTemporais(usuarioId);

      expect(result.data.crescimento).toBe(0);
    });

    it('deve lançar InternalServerErrorException em caso de erro', async () => {
      // Caso: erro inesperado ao analisar tendências temporais
      const usuarioId = 1;

      mockRepository.count.mockRejectedValue(new Error('Erro de banco'));

      await expect(service.analisarTendenciasTemporais(usuarioId))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  /**
   * Testes para o método analisePreditiva
   * - Verifica análise preditiva completa
   * - Verifica tratamento de usuário inválido
   * - Verifica tratamento de tarefas sem histórico
   * - Verifica tratamento de erro interno
   */
  describe('analisePreditiva', () => {
    it('deve realizar análise preditiva com sucesso', async () => {
      // Caso de sucesso: retorna análise preditiva detalhada
      const usuarioId = 1;
      const mockTarefasConcluidas = [
        {
          ...mockTarefa,
          taskId: 1,
          prioridade: 1,
          historicotarefas: [{ alteradoEm: new Date(Date.now() + 86400000) }], // +1 dia
        },
        {
          ...mockTarefa,
          taskId: 2,
          prioridade: 2,
          historicotarefas: [{ alteradoEm: new Date(Date.now() + 172800000) }], // +2 dias
        },
      ];

      const mockTarefasEmAndamento = [
        {
          ...mockTarefa,
          taskId: 3,
          prioridade: 1,
          criadoEm: new Date(Date.now() - 86400000), // -1 dia
        },
      ];

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getMany
        .mockResolvedValueOnce(mockTarefasConcluidas) // tarefasConcluidas
        .mockResolvedValueOnce(mockTarefasEmAndamento); // tarefasEmAndamento

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.analisePreditiva(usuarioId);

      expect(result).toEqual({
        message: 'Análise preditiva calculada com sucesso.',
        data: {
          mediasTempoPorPrioridade: {
            1: 1,
            2: 2,
          },
          tarefasPorPrioridade: {
            1: 1,
            2: 1,
          },
          tarefasComRiscoDeAtraso: expect.any(Array),
          totalTarefasAnalisadas: 2,
        },
      });
    });

    it('deve lançar InternalServerErrorException para ID de usuário inválido', async () => {
      // Caso: usuárioId inválido (0)
      const usuarioId = 0;

      await expect(service.analisePreditiva(usuarioId))
        .rejects.toThrow(InternalServerErrorException);
    });

    it('deve lidar com tarefas sem histórico', async () => {
      // Caso: tarefa concluída sem histórico, não deve calcular média
      const usuarioId = 1;
      const mockTarefasConcluidas = [
        {
          ...mockTarefa,
          taskId: 1,
          prioridade: 1,
          historicotarefas: [],
        },
      ];

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getMany
        .mockResolvedValueOnce(mockTarefasConcluidas)
        .mockResolvedValueOnce([]);

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.analisePreditiva(usuarioId);

      expect(result.data.mediasTempoPorPrioridade).toEqual({});
      expect(result.data.totalTarefasAnalisadas).toBe(1);
    });

    it('deve lançar InternalServerErrorException em caso de erro', async () => {
      // Caso: erro inesperado ao realizar análise preditiva
      const usuarioId = 1;

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getMany.mockRejectedValue(new Error('Erro de banco'));
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.analisePreditiva(usuarioId))
        .rejects.toThrow(InternalServerErrorException);
    });
  });
}); 