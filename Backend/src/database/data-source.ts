import 'reflect-metadata';
import { DataSource, type DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = process.env.DATABASE_URL
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/database/migrations/*.js'],
    }
  : {
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: Number(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'startintech_db',
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/database/migrations/*.js'],
    };

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
