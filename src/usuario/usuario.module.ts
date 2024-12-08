import { Module } from '@nestjs/common';
import { EntityProviders } from 'src/Common/Providers/entities.provider';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { DatabaseModule } from 'src/DataBase/data-base.module';

@Module({
  imports: [DatabaseModule],
  exports: [UsuarioService],
  controllers: [UsuarioController],
  providers: [UsuarioService, ...EntityProviders],
})
export class UsuarioModule {}
