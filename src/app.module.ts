// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeormConfig from '../typeorm.config';

import { AppealModule } from './appeal/appeal.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormConfig),
    AppealModule,
  ],
})
export class AppModule {}