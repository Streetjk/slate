import { Body, Controller, Post } from '@nestjs/common';
import type { AssistantResponseT } from 'shared';
import { AssistantRequestDto } from './dto/assistant-request.dto';
import { GeminiAssistantService } from './gemini-assistant.service';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistant: GeminiAssistantService) {}

  @Post('answer')
  answer(@Body() body: AssistantRequestDto): Promise<AssistantResponseT> {
    return this.assistant.answer(body);
  }
}
