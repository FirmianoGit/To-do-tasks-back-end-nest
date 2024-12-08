import { Historicotarefa } from 'src/entities/Historicotarefa';
import { Statustarefa } from 'src/entities/Statustarefa';
import { Tarefas } from 'src/entities/Tarefas';
import { Usuarios } from 'src/entities/Usuarios';
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DATABASE_HOST,
        port: 3306,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: 'teksystem',
        entities: [
          __dirname + '/../**/*.entity{.ts,.js}',
          Usuarios,
          Tarefas,
          Statustarefa,
          Historicotarefa,
        ],
        logging: true,
      });

      return dataSource.initialize();
    },
  },
];
