import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTarefaDto {
  // Título da tarefa, com validação de não ser vazio e comprimento máximo de 255 caracteres
  @IsNotEmpty({ message: 'O título da tarefa é obrigatório.' })
  @IsString({ message: 'O título da tarefa deve ser uma string.' })
  @MaxLength(255, {
    message: 'O título da tarefa não pode exceder 255 caracteres.',
  })
  titulo: string;

  // Descrição da tarefa, com validação de não ser vazia
  @IsNotEmpty({ message: 'A descrição da tarefa é obrigatória.' })
  @IsString({ message: 'A descrição da tarefa deve ser uma string.' })
  descricao: string;

  @IsInt({ message: 'O status da tarefa deve ser um número inteiro.' })
  statusId: number;

  // Prioridade da tarefa, com valor numérico entre 1 e 5
  @IsNotEmpty({ message: 'A prioridade da tarefa é obrigatória.' })
  @IsInt({ message: 'A prioridade da tarefa deve ser um número inteiro.' })
  @Min(1, { message: 'A prioridade deve ser no mínimo 1.' })
  @Max(5, { message: 'A prioridade deve ser no máximo 5.' })
  prioridade: number;
}
