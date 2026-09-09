export type ProjectCategory =
  | "Brand Film"
  | "Product Motion"
  | "Performance Creative"
  | "Concept"
  | "Personal";

export interface StoryboardItem {
  src: string;
  alt: string;
}

/** Case study credits column — name / role pairs (mono caps in UI). */
export interface CreditEntry {
  name: string;
  role: string;
}

export interface ProjectFrontmatter {
  title: string;
  client: string;
  year: number;
  role: string[];
  heroVideo: string;
  posterImage: string;
  category: ProjectCategory;
  featured: boolean;
  /** Sort order among featured tiles (lower = earlier). */
  featuredRank?: number;
  /** Static cover still for the project tile (shown first). */
  tileImage?: string;
  /**
   * Optional GIF for hover playback on the tile. Drop at path when ready;
   * missing files are ignored gracefully.
   */
  tileGif?: string;
  /** Right-hand label on home grid, e.g. "(Personal) 2026" or "2026". */
  tileTag?: string;
  /** Editorial index label on the tile, e.g. "V001". Mono caps, top-left of media. */
  tileCode?: string;
  /** Case study intro — center column under title (2 short paragraphs). */
  introParagraphs?: string[];
  /** Two-column detail block below the hero video. */
  detailColumnLeft?: string;
  detailColumnRight?: string;
  /** Storyboard / process grid (GIF, WebP, or AVIF). */
  storyboard?: StoryboardItem[];
  /** Optional credits beside intro copy (two sub-columns: names · roles). */
  credits?: CreditEntry[];
  /** Label above the storyboard grid (default: “STYLE FRAME”). */
  storyboardHeading?: string;
}

export interface ProjectRecord extends ProjectFrontmatter {
  slug: string;
  body: string;
}
