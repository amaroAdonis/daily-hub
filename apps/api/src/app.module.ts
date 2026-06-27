import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { EventsModule } from './modules/events/events.module';
import { GoalsModule } from './modules/goals/goals.module';

@Module({
  imports: [
    // .env é lido na raiz do monorepo.
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env'] }),
    PrismaModule,
    HealthModule,
    TasksModule,
    CalendarModule,
    EventsModule,
    GoalsModule,
    // Os próximos módulos de feature (notes, contacts, tags, links) serão
    // registrados aqui à medida que avançarmos nas fases.
  ],
})
export class AppModule {}
