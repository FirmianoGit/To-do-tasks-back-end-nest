import { Module } from '@nestjs/common';
import { databaseProviders } from '../Common/Providers/database.provider';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
