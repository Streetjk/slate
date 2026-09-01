import { Module } from '@nestjs/common';
import { GeminiConfig } from './gemini.config';
import { GeminiAssistantService } from './gemini-assistant.service';
import { GeminiLiveService } from './gemini-live.service';
import { AssistantController } from './assistant.controller';

@Module({
  controllers: [AssistantController],
  providers: [GeminiConfig, GeminiAssistantService, GeminiLiveService],
  exports: [GeminiConfig, GeminiAssistantService, GeminiLiveService],
})
export class AssistantModule {}
