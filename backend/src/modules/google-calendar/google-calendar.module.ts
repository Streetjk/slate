import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import { SecurityModule } from '../../infra/security/security.module';
import { GoogleCalendarConfirmationService } from './google-calendar-confirmation.service';
import { GoogleCalendarController } from './google-calendar.controller';
import { GoogleCalendarOAuthService } from './google-calendar-oauth.service';
import { GoogleCalendarWriteService } from './google-calendar-write.service';

@Module({
  imports: [PrismaModule, SecurityModule],
  controllers: [GoogleCalendarController],
  providers: [
    GoogleCalendarOAuthService,
    GoogleCalendarConfirmationService,
    GoogleCalendarWriteService,
  ],
  exports: [
    GoogleCalendarConfirmationService,
    GoogleCalendarOAuthService,
    GoogleCalendarWriteService,
  ],
})
export class GoogleCalendarModule {}
