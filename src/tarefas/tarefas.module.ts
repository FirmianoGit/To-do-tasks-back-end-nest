import { Module } from '@nestjs/common';
import { TarefasService } from './tarefas.service';
import { TarefasController } from './tarefas.controller';
import { EntityProviders } from 'src/Common/Providers/entities.provider';
import { DatabaseModule } from 'src/DataBase/data-base.module';

@Module({
  imports: [DatabaseModule],
  exports: [TarefasService],
  controllers: [TarefasController],
  providers: [TarefasService, ...EntityProviders],
})
export class TarefasModule {}
