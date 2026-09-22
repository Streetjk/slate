import { z } from 'zod';

const OutlookIcsConnectRequest = z.object({
  url: z.string().trim().url().max(4096),
});

export class OutlookIcsConnectDto {
  static readonly schema = OutlookIcsConnectRequest;
  declare url: string;
}
