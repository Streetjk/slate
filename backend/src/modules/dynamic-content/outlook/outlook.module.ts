import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../infra/prisma/prisma.module';
import { SecurityModule } from '../../../infra/security/security.module';
import { MicrosoftGraphCalendarClient } from './microsoft-graph-calendar.client';
import { MicrosoftOAuthService } from './microsoft-oauth.service';
import { OutlookController } from './outlook.controller';
import { OutlookIcsService } from './outlook-ics.service';
import { OutlookCalendarProvider } from '../providers/outlook-calendar.provider';

@Module({
  imports: [PrismaModule, SecurityModule],
  controllers: [OutlookController],
  providers: [
    MicrosoftOAuthService,
    MicrosoftGraphCalendarClient,
    OutlookIcsService,
    OutlookCalendarProvider,
  ],
  exports: [
    MicrosoftOAuthService,
    MicrosoftGraphCalendarClient,
    OutlookIcsService,
    OutlookCalendarProvider,
  ],
})
export class OutlookModule {}
