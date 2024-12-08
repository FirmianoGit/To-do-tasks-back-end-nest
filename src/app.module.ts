import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './usuario/usuario.module';
import { JwtAuthGuard } from './auth/Guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { TarefasModule } from './tarefas/tarefas.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [UsuarioModule, AuthModule, TarefasModule, StatisticsModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
