import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'admin',
  password: '12345',
  database: 'appeals_db',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
};

export default config;