import { Module } from '@nestjs/common';
import { GeminiConfig } from './gemini.config';
import { GeminiAssistantService } from './gemini-assistant.service';
import { GeminiLiveService } from './gemini-live.service';
import { AssistantController } from './assistant.controller';
import { XiaozhiVoiceGateway } from './xiaozhi-voice.gateway';

@Module({
  controllers: [AssistantController],
  providers: [GeminiConfig, GeminiAssistantService, GeminiLiveService, XiaozhiVoiceGateway],
  exports: [GeminiConfig, GeminiAssistantService, GeminiLiveService, XiaozhiVoiceGateway],
})
export class AssistantModule {}
