import type { ContentDetailT } from 'shared';

export function weatherLifecycleMarker(content: ContentDetailT): string | null {
  if (content.kind !== 'dynamic' || content.dynamic_type !== 'weather') return null;
  return `[slate] weather lifecycle marker stage=frontend_view type=weather error_present=${
    content.dynamic_render_error_present ? 1 : 0
  }`;
}
