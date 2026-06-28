import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { EventsModule } from './modules/events/events.module';
import { GoalsModule } from './modules/goals/goals.module';
import { NotesModule } from './modules/notes/notes.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { IntegrationModule } from './modules/integration/integration.module';

@Module({
  imports: [
    // .env é lido na raiz do monorepo.
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env'] }),
    PrismaModule,
    AuthModule,
    HealthModule,
    TasksModule,
    CalendarModule,
    EventsModule,
    GoalsModule,
    NotesModule,
    ContactsModule,
    IntegrationModule,
  ],
})
export class AppModule {}
