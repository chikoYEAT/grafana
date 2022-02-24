//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// This file was almost autogenerated by cuetsy.
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export const modelVersion = Object.freeze([0, 0]);

export enum PanelLayout {
  List = 'list',
  Previews = 'previews',
}

export interface PanelOptions {
  layout?: PanelLayout;
  folderId?: number;
  maxItems: number;
  query: string;
  showHeadings: boolean;
  showRecentlyViewed: boolean;
  showSearch: boolean;
  showStarred: boolean;
  tags: string[];
}

export const defaultPanelOptions: PanelOptions = {
  layout: PanelLayout.List,
  maxItems: 10,
  query: '',
  showHeadings: true,
  showRecentlyViewed: false,
  showSearch: false,
  showStarred: true,
  tags: [],
};
