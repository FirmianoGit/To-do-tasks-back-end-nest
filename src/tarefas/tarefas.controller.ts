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

  @Post()
  async create(
    @Body() createTarefaDto: CreateTarefaDto,
    @Request() req: AuthRequest, // Aqui o req já deve ser corretamente tipado
  ) {
    // Logando o req.user para verificar os dados do usuário autenticado
    console.log('User Authenticated:', req.user);

    // Obtém o ID do usuário autenticado
    const usuarioId = req.user.id;

    // Passa o ID do usuário para o serviço ao criar a tarefa
    return this.tarefasService.create(createTarefaDto, usuarioId);
  }

  @Get()
  async getTasks(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Request() req: AuthRequest, // Aqui, o tipo de req pode ser o tipo do request HTTP (pode ser qualquer tipo que contenha a propriedade 'user')
  ): Promise<{ tasks: Tarefas[]; total: number }> {
    // Extraímos o userId do req.user (assumindo que você configurou o guard para adicionar o usuário à requisição)
    const userId = req.user.id;

    // Passando os parâmetros para o serviço
    return this.tarefasService.findAllByUserId(userId, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tarefasService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTarefaDto: UpdateTarefaDto) {
    return this.tarefasService.update(+id, updateTarefaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tarefasService.remove(+id);
  }
}
