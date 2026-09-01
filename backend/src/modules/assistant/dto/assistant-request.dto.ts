import { AssistantRequest, type AssistantRequestT } from 'shared';

export class AssistantRequestDto implements AssistantRequestT {
  static readonly schema = AssistantRequest;
  declare requestId: string;
  declare text: string;
  declare language: AssistantRequestT['language'];
  declare conversationId?: string;
  declare enableWebSearch: boolean;
}
