import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../infra/prisma/prisma.module';
import { SecurityModule } from '../../../infra/security/security.module';
import { MicrosoftGraphCalendarClient } from './microsoft-graph-calendar.client';
import { MicrosoftOAuthService } from './microsoft-oauth.service';
import { OutlookController } from './outlook.controller';
import { OutlookCalendarProvider } from '../providers/outlook-calendar.provider';

@Module({
  imports: [PrismaModule, SecurityModule],
  controllers: [OutlookController],
  providers: [MicrosoftOAuthService, MicrosoftGraphCalendarClient, OutlookCalendarProvider],
  exports: [MicrosoftOAuthService, MicrosoftGraphCalendarClient, OutlookCalendarProvider],
})
export class OutlookModule {}
