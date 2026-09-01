import { Module } from '@nestjs/common';
import { GoogleCalendarModule } from '../google-calendar/google-calendar.module';
import { GeminiConfig } from './gemini.config';
import { createGeminiClient, GEMINI_CLIENT_FACTORY } from './gemini.client';
import { GeminiAssistantService } from './gemini-assistant.service';
import { GeminiLiveService } from './gemini-live.service';
import { AssistantController } from './assistant.controller';
import { XiaozhiVoiceGateway } from './xiaozhi-voice.gateway';

@Module({
  imports: [GoogleCalendarModule],
  controllers: [AssistantController],
  providers: [
    GeminiConfig,
    { provide: GEMINI_CLIENT_FACTORY, useValue: createGeminiClient },
    GeminiAssistantService,
    GeminiLiveService,
    XiaozhiVoiceGateway,
  ],
  exports: [GeminiConfig, GeminiAssistantService, GeminiLiveService, XiaozhiVoiceGateway],
})
export class AssistantModule {}
