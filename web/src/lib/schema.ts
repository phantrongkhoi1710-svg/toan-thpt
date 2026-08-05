export type Level = 1 | 2 | 3 | 4;

export type ThemeId = "logic" | "island" | "cinema";

export interface LessonTheme {
  id: ThemeId;
  accentFrom: string;
  accentTo: string;
  mapBoardClass: string;
  nodeClass: string;
  xpLabel: string;
  mapName: string;
  sectionPrefix: string;
  chestClosed: string;
  chestOpen: string;
  successText: string;
  failText: string;
  lockedToast: string;
  resetLabel: string;
  resetConfirm: string;
  brandMark: "book" | "venn" | "cinema";
}

export interface ChallengeQuestion {
  level: Level;
  title: string;
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
  image?: string;
}

export interface QuizOption {
  html: string;
  label?: string;
}

export type Quiz =
  | {
      kind: "single";
      options: QuizOption[];
      correct: number;
      explain: string;
      variant?: "choices" | "vs";
    }
  | {
      kind: "multi";
      options: QuizOption[];
      correct: number[];
      explain: string;
    }
  | {
      kind: "venn";
      correct: string[];
      explain: string;
    }
  | {
      kind: "halfplane";
      correct: "above" | "below";
      explain: string;
    };

export interface SlidePart {
  n: string;
  title: string;
  text: string;
  color?: string;
}

interface SlideBase {
  title: string;
  banner?: string;
  bannerTone?: "blue" | "orange" | "teal" | "violet" | "rose" | "cyan" | "indigo" | "amber";
}

export type Slide =
  | (SlideBase & {
      type: "hero";
      eyebrow: string;
      heading: string;
      body: string;
      image?: string;
      imageAlt?: string;
    })
  | (SlideBase & {
      type: "content";
      heading: string;
      definition?: string;
      bullets?: string[];
      tags?: string[];
      callout?: string;
      image?: string;
      imageAlt?: string;
      parts?: SlidePart[];
      nests?: string[];
      afterDefinition?: string;
    })
  | (SlideBase & {
      type: "quiz";
      heading: string;
      prompt?: string;
      image?: string;
      imageAlt?: string;
      quiz: Quiz;
    })
  | (SlideBase & {
      type: "summary";
      heading: string;
      parts: SlidePart[];
      ctaLabel: string;
    });

export interface Lesson {
  id: string;
  number: number;
  slug: string;
  title: string;
  shortTitle: string;
  chapter: string;
  periods: number;
  blurb: string;
  isNew?: boolean;
  theme: LessonTheme;
  progressKey: string;
  levelLabels: Record<Level, string>;
  xpByLevel: Record<Level, number>;
  slides: Slide[];
  challenges: ChallengeQuestion[];
  sidebarFoot: string;
}
