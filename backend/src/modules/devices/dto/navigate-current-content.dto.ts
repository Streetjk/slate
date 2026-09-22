import {
  NavigateCurrentContentRequest,
  type NavigateCurrentContentRequestT,
} from 'shared';

export class NavigateCurrentContentDto implements NavigateCurrentContentRequestT {
  static readonly schema = NavigateCurrentContentRequest;
  declare seq: number;
  declare manifest_etag: string;
  declare direction: 'next' | 'prev';
}
