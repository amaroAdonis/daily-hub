/**
 * Seed de dados de exemplo para desenvolvimento e demonstração.
 * Rode com: pnpm db:seed
 */
import { PrismaClient, TaskStatus, Priority, EntityType, GoalHorizon } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Usuário único de desenvolvimento (idempotente).
  const user = await prisma.user.upsert({
    where: { email: 'voce@daily-hub.dev' },
    update: {},
    create: { email: 'voce@daily-hub.dev', name: 'Você' },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Uma meta, uma sub-meta e tarefas vinculadas.
  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Publicar o portfólio',
      description: 'Concluir o Daily Hub e colocar no ar.',
      horizon: GoalHorizon.LONG,
      progress: 20,
    },
  });

  await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Finalizar a fatia de Tarefas',
      horizon: GoalHorizon.SHORT,
      progress: 60,
      parentId: goal.id,
    },
  });

  const task = await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Configurar o ambiente do projeto',
      date: today,
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      goalId: goal.id,
      completedAt: new Date(),
    },
  });

  const contact = await prisma.contact.create({
    data: { userId: user.id, name: 'Mentora de carreira', email: 'mentora@exemplo.dev' },
  });

  // Um compromisso pontual e um recorrente, para a visão de calendário.
  await prisma.event.create({
    data: {
      userId: user.id,
      title: 'Conversa com a mentora',
      startsAt: new Date(today.getTime() + 15 * 60 * 60 * 1000), // hoje, 15h UTC
      endsAt: new Date(today.getTime() + 16 * 60 * 60 * 1000),
      location: 'Google Meet',
      reminderMin: 30,
    },
  });
  await prisma.event.create({
    data: {
      userId: user.id,
      title: 'Bloco de foco no portfólio',
      startsAt: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9h UTC
      endsAt: new Date(today.getTime() + 11 * 60 * 60 * 1000),
      recurrence: 'FREQ=WEEKLY', // toda semana neste dia
    },
  });

  const note = await prisma.note.create({
    data: {
      userId: user.id,
      title: 'Ideias de features',
      content: '- Visão de calendário\n- Vincular notas a contatos',
      date: today,
    },
  });

  // Exemplo da camada de integração: a nota menciona a contato.
  await prisma.entityLink.create({
    data: {
      sourceType: EntityType.NOTE,
      sourceId: note.id,
      targetType: EntityType.CONTACT,
      targetId: contact.id,
      relation: 'mencionado',
    },
  });

  // Exemplo de tag aplicada a entidades de tipos diferentes.
  const tag = await prisma.tag.create({
    data: { userId: user.id, name: 'portfolio', color: '#0ea5a4' },
  });
  await prisma.tagging.createMany({
    data: [
      { tagId: tag.id, entityType: EntityType.TASK, entityId: task.id },
      { tagId: tag.id, entityType: EntityType.GOAL, entityId: goal.id },
    ],
  });

  console.log('Seed concluído para o usuário', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
