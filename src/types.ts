export type TitleKind = 'movie' | 'series';

export type Title = {
  id: string;
  name: string;
  kind: TitleKind;
  year: number;
  runtimeMinutes?: number;
  seasons?: number;
  rating: string;
  genres: string[];
  description: string;
  artworkUrl: string;
};

export type Rail = {
  id: string;
  title: string;
  itemIds: string[];
};

export type HomeCatalog = {
  rails: Rail[];
  titles: Record<string, Title>;
};
