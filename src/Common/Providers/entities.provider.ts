import { Tarefas } from 'src/entities/Tarefas';
import { Usuarios } from 'src/entities/Usuarios';
import { DataSource } from 'typeorm';

const createRepositoryProvider = (entity: any, token: string) => ({
  provide: token,
  useFactory: (dataSource: DataSource) => dataSource.getRepository(entity),
  inject: ['DATA_SOURCE'],
});

export const EntityProviders = [
  createRepositoryProvider(Usuarios, 'USUARIO_REPOSITORY'),
  createRepositoryProvider(Tarefas, 'TAREFAS_REPOSITORY'),
];
