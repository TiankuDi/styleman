export type OccasionType = 'casual' | 'dating' | 'business' | 'streetwear' | 'party' | 'all';

export interface StylistMetric {
  name: string;
  label: string;
  score: number; // 0 - 100
  comment: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  percentage: number;
  role: 'primary' | 'secondary' | 'accent';
  description: string;
}

export interface OutfitItemPin {
  id: string;
  type: 'headwear' | 'top' | 'bottom' | 'outerwear' | 'footwear' | 'bag' | 'accessory';
  name: string;
  x: number; // 0 - 100%
  y: number; // 0 - 100%
  score: number; // 1 - 5
  critique: string;
  recommendation: string;
}

export interface StyleReport {
  overallScore: number;
  rankBadge: 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B';
  styleArchetype: string;
  seasonPaletteType: string;
  spokenCritique: string;
  headline: string;
  metrics: {
    colorHarmony: StylistMetric;
    silhouetteFit: StylistMetric;
    styleCohesion: StylistMetric;
    accessoryDetail: StylistMetric;
    occasionSuitability: StylistMetric;
    hairGrooming: StylistMetric;
  };
  strengths: string[];
  improvements: string[];
  colorPalette: ColorSwatch[];
  items: OutfitItemPin[];
  bodyProportionAdvice: string;
  recommendedOccasions: {
    occasion: string;
    fitRate: number; // 0 - 100
  }[];
  stylingTips: {
    title: string;
    advice: string;
  }[];
}

export interface SampleOutfit {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  description: string;
}
