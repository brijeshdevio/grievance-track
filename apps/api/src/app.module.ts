import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { env } from '@/config';
import { AuthModule } from '@/modules/auth/auth.module';
import { JwtAuthGuard, RoleGuard } from '@/common/guards';
import { EmailsModule } from '@/queues/emails/emails.module';
import { DepartmentsModule } from '@/modules/departments/departments.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.forRoot({
      connection: {
        url: env.REDIS_URL,
      },
    }),
    AuthModule,
    EmailsModule,
    DepartmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtAuthGuard, RoleGuard],
  exports: [JwtAuthGuard, RoleGuard],
})
export class AppModule {}
