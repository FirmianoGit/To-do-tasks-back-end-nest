import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Tarefas } from 'src/entities/Tarefas';
import { Repository } from 'typeorm';
import { CreateTarefaDto } from './dto/create-tarefa.dto';
import { UpdateTarefaDto } from './dto/update-tarefa.dto';

@Injectable()
export class TarefasService {
  constructor(
    @Inject('TAREFAS_REPOSITORY')
    private readonly tarefaRepository: Repository<Tarefas>,
  ) {}

  // Criação de uma nova tarefa
  async create(
    createTarefaDto: CreateTarefaDto,
    usuarioId: number,
  ): Promise<Tarefas> {
    try {
      const tarefa = this.tarefaRepository.create({
        ...createTarefaDto, // Preenche os dados vindos do DTO
        usuarioId, // Atribui o ID do usuário autenticado ao campo usuarioId
      });
      return await this.tarefaRepository.save(tarefa);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao criar tarefa.');
    }
  }

  // Atualização de uma tarefa existente
  async update(id: number, updateTarefaDto: UpdateTarefaDto): Promise<Tarefas> {
    try {
      console.log(id);
      const tarefa = await this.tarefaRepository.findOne({
        where: { taskId: id },
      });

      if (!tarefa) {
        throw new NotFoundException(`Tarefa com ID ${id} não encontrada.`);
      }

      // Atualiza a tarefa com os dados fornecidos
      Object.assign(tarefa, updateTarefaDto);

      return await this.tarefaRepository.save(tarefa);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao atualizar tarefa.');
    }
  }

  // Remoção de uma tarefa existente
  async remove(id: number): Promise<void> {
    try {
      const tarefa = await this.tarefaRepository.findOne({
        where: { taskId: id },
      });

      if (!tarefa) {
        throw new NotFoundException(`Tarefa com ID ${id} não encontrada.`);
      }

      await this.tarefaRepository.remove(tarefa);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao remover tarefa.');
    }
  }

  // Obter todas as tarefas de um usuário específico
  async findAllByUserId(
    userId: number,
    page: number,
    limit: number,
  ): Promise<{ tasks: Tarefas[]; total: number }> {
    try {
      // Definindo o skip e take para a paginação
      const [tasks, total] = await this.tarefaRepository.findAndCount({
        where: { usuarioId: userId },
        skip: (page - 1) * limit, // Pular as tarefas anteriores com base na página atual
        take: limit, // Limitar o número de tarefas retornadas
      });

      return { tasks, total }; // Retornando as tarefas e o total
    } catch (error) {
      throw new InternalServerErrorException('Erro ao buscar tarefas.');
    }
  }
  // Obter uma tarefa específica pelo ID
  async findOne(taskId: number): Promise<Tarefas> {
    try {
      const tarefa = await this.tarefaRepository.findOne({ where: { taskId } });

      if (!tarefa) {
        throw new NotFoundException(`Tarefa com ID ${taskId} não encontrada.`);
      }

      return tarefa;
    } catch (error) {
      throw new InternalServerErrorException('Erro ao buscar tarefa.');
    }
  }
}
