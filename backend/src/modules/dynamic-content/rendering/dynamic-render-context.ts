export interface DynamicRenderContext {
  type: string;
  frameName?: string | null;
  config: Record<string, unknown>;
  data: Record<string, unknown> | null;
  renderedAt: Date;
  /** Actual render clock, distinct from the noon date used for calendar navigation. */
  now?: Date;
}
