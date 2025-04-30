
export type WorkshopTemplate = {
  id: string;
  name: string;
  description: string;
  purpose: string;
  duration: number; // in minutes
  aiFeatures: string[];
  idealFor: string[];
  valueProposition: string;
};

export type TemplateCategory = 'agile' | 'design' | 'strategy' | 'team' | 'product';
