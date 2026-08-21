import type { HomeCatalog, Title } from '../types';

const artwork = (seed: string) =>
  `https://picsum.photos/seed/streamshelf-${seed}/400/600`;

const titles: Title[] = [
  {
    id: 'harbor-lights',
    name: 'Harbor Lights',
    kind: 'series',
    year: 2024,
    seasons: 2,
    rating: 'TV-MA',
    genres: ['Drama', 'Mystery'],
    description:
      'A dockside investigator in a rain-soaked port city uncovers a smuggling network that reaches into city hall.',
    artworkUrl: artwork('harbor'),
  },
  {
    id: 'northbound',
    name: 'Northbound',
    kind: 'movie',
    year: 2023,
    runtimeMinutes: 118,
    rating: 'PG-13',
    genres: ['Adventure', 'Family'],
    description:
      'Two siblings drive a vintage railcar toward the Arctic Circle to deliver a letter their grandfather never sent.',
    artworkUrl: artwork('northbound'),
  },
  {
    id: 'signal-loss',
    name: 'Signal Loss',
    kind: 'series',
    year: 2025,
    seasons: 1,
    rating: 'TV-14',
    genres: ['Sci-Fi', 'Thriller'],
    description:
      'When a deep-space probe goes silent, a ground team has seventy-two hours to decide whether the message is a warning.',
    artworkUrl: artwork('signal'),
  },
  {
    id: 'late-service',
    name: 'Late Service',
    kind: 'movie',
    year: 2022,
    runtimeMinutes: 97,
    rating: 'R',
    genres: ['Comedy', 'Drama'],
    description:
      'A night-shift diner cook tries to keep the last booth open for regulars who only tell the truth after midnight.',
    artworkUrl: artwork('late'),
  },
  {
    id: 'glass-orchard',
    name: 'Glass Orchard',
    kind: 'series',
    year: 2021,
    seasons: 3,
    rating: 'TV-14',
    genres: ['Romance', 'Drama'],
    description:
      'Rival greenhouse designers compete for a city contract while sharing a crumbling estate on the edge of town.',
    artworkUrl: artwork('orchard'),
  },
  {
    id: 'kiln',
    name: 'Kiln',
    kind: 'movie',
    year: 2024,
    runtimeMinutes: 104,
    rating: 'PG-13',
    genres: ['Documentary'],
    description:
      'A ceramicist in Kyoto rebuilds a wood-fired kiln using only notes left by a teacher she never met.',
    artworkUrl: artwork('kiln'),
  },
  {
    id: 'second-shift',
    name: 'Second Shift',
    kind: 'series',
    year: 2020,
    seasons: 4,
    rating: 'TV-MA',
    genres: ['Crime', 'Drama'],
    description:
      'Paramedics on the overnight rotation become unofficial detectives when hospital records start disappearing.',
    artworkUrl: artwork('shift'),
  },
  {
    id: 'paper-moon-radio',
    name: 'Paper Moon Radio',
    kind: 'movie',
    year: 2019,
    runtimeMinutes: 89,
    rating: 'PG',
    genres: ['Music', 'Feel-good'],
    description:
      'A college station manager keeps a 24-hour broadcast alive during a blizzard that cuts the town off from the grid.',
    artworkUrl: artwork('radio'),
  },
  {
    id: 'red-line-express',
    name: 'Red Line Express',
    kind: 'series',
    year: 2023,
    seasons: 2,
    rating: 'TV-PG',
    genres: ['Animation', 'Adventure'],
    description:
      'Couriers on a subterranean maglev race packages—and secrets—between cities that officially do not exist.',
    artworkUrl: artwork('redline'),
  },
  {
    id: 'after-the-matinee',
    name: 'After the Matinee',
    kind: 'movie',
    year: 2025,
    runtimeMinutes: 126,
    rating: 'PG-13',
    genres: ['Mystery', 'Period'],
    description:
      'A 1950s projectionist notices that one extra frame appears in every reel—and it is always a different face.',
    artworkUrl: artwork('matinee'),
  },
  {
    id: 'midnight-echo',
    name: 'Midnight Echo',
    kind: 'movie',
    year: 2024,
    runtimeMinutes: 112,
    rating: 'R',
    genres: ['Thriller', 'Mystery'],
    description:
      'A late-night radio host begins hearing listener messages that predict crimes before they happen.',
    artworkUrl: artwork('midnight-echo'),
  },
  {
    id: 'sunset-circuit',
    name: 'Sunset Circuit',
    kind: 'series',
    year: 2022,
    seasons: 2,
    rating: 'TV-14',
    genres: ['Sci-Fi', 'Drama'],
    description:
      'A courier network on a dying planet races to keep a floating city connected before the sky goes dark.',
    artworkUrl: artwork('sunset-circuit'),
  },
  {
    id: 'river-letters',
    name: 'River Letters',
    kind: 'movie',
    year: 2021,
    runtimeMinutes: 101,
    rating: 'PG',
    genres: ['Drama', 'Family'],
    description:
      'A teenage archivist returns to her hometown to restore a flood-damaged library and uncovers a hidden correspondence.',
    artworkUrl: artwork('river-letters'),
  },
];

export const catalogFixture: HomeCatalog = {
  titles: Object.fromEntries(titles.map((title) => [title.id, title])),
  rails: [
    {
      id: 'trending',
      title: 'Trending this week',
      itemIds: ['harbor-lights', 'signal-loss', 'northbound', 'after-the-matinee'],
    },
    {
      id: 'new',
      title: 'New on StreamShelf',
      itemIds: ['kiln', 'after-the-matinee', 'signal-loss', 'red-line-express'],
    },
    {
      id: 'staff',
      title: 'Staff picks',
      itemIds: [
        'late-service',
        'glass-orchard',
        'paper-moon-radio',
        'second-shift',
        'kiln',
        'midnight-echo',
        'sunset-circuit',
        'river-letters',
      ],
    },
  ],
};
