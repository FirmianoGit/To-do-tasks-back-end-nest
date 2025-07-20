import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { AuthRequest } from 'src/Common/Auth-models/AuthRequest';
import { Tarefas } from 'src/entities/Tarefas';
import { CreateTarefaDto } from './dto/create-tarefa.dto';
import { UpdateTarefaDto } from './dto/update-tarefa.dto';
import { TarefasService } from './tarefas.service';

@Controller('tasks')
export class TarefasController {
  constructor(private readonly tarefasService: TarefasService) {}

  /**
   * Cria uma nova tarefa para o usuário autenticado.
   * 
   * @param createTarefaDto Dados da tarefa a ser criada
   * @param req Requisição autenticada contendo o usuário
   * @returns Tarefa criada
   */
  @Post()
  async create(
    @Body() createTarefaDto: CreateTarefaDto,
    @Request() req: AuthRequest,
  ) {
    // Logando o req.user para verificar os dados do usuário autenticado
    console.log('User Authenticated:', req.user);

    // Obtém o ID do usuário autenticado
    const usuarioId = req.user.id;

    // Passa o ID do usuário para o serviço ao criar a tarefa
    return this.tarefasService.create(createTarefaDto, usuarioId);
  }

  /**
   * Lista todas as tarefas do usuário autenticado, com suporte a paginação.
   * 
   * @param page Número da página (padrão: 1)
   * @param limit Quantidade de itens por página (padrão: 10)
   * @param req Requisição autenticada contendo o usuário
   * @returns Lista paginada de tarefas do usuário
   */
  @Get()
  async getTasks(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Request() req: AuthRequest,
  ): Promise<{ tasks: Tarefas[]; total: number }> {
    // Extraímos o userId do req.user (assumindo que você configurou o guard para adicionar o usuário à requisição)
    const userId = req.user.id;

    // Passando os parâmetros para o serviço
    return this.tarefasService.findAllByUserId(userId, page, limit);
  }

  /**
   * Busca uma tarefa específica pelo ID.
   * 
   * @param id ID da tarefa a ser buscada
   * @returns Tarefa encontrada
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tarefasService.findOne(+id);
  }

  /**
   * Atualiza uma tarefa existente.
   * 
   * @param id ID da tarefa a ser atualizada
   * @param updateTarefaDto Dados atualizados da tarefa
   * @returns Tarefa atualizada
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() updateTarefaDto: UpdateTarefaDto) {
    return this.tarefasService.update(+id, updateTarefaDto);
  }

  /**
   * Remove uma tarefa pelo ID.
   * 
   * @param id ID da tarefa a ser removida
   * @returns Confirmação da remoção
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tarefasService.remove(+id);
  }
}
