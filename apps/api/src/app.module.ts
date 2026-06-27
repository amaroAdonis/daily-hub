import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CalendarModule } from './modules/calendar/calendar.module';

@Module({
  imports: [
    // .env é lido na raiz do monorepo.
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env'] }),
    PrismaModule,
    HealthModule,
    TasksModule,
    CalendarModule,
    // Os próximos módulos de feature (goals, notes, events, contacts, tags,
    // links) serão registrados aqui à medida que avançarmos nas fases.
  ],
})
export class AppModule {}
