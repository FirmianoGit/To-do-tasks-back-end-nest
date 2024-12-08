import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { TarefasModule } from 'src/tarefas/tarefas.module';
import { EntityProviders } from 'src/Common/Providers/entities.provider';
import { DatabaseModule } from 'src/DataBase/data-base.module';

@Module({
  imports: [TarefasModule, DatabaseModule],
  controllers: [StatisticsController],
  providers: [StatisticsService, ...EntityProviders],
})
export class StatisticsModule {}
