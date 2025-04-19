
export type PredefinedFormat = 'report' | 'prd' | 'proposal' | 'analysis' | 'strategy' | 'other';

export interface OutputFormat {
  type: PredefinedFormat;
  customFormat?: string;
  description: string;
}

export const OUTPUT_FORMATS: Record<Exclude<PredefinedFormat, 'other'>, OutputFormat> = {
  report: {
    type: 'report',
    description: 'A detailed document with executive summary, findings, and recommendations'
  },
  prd: {
    type: 'prd',
    description: 'Product Requirements Document with features, specifications, and success criteria'
  },
  proposal: {
    type: 'proposal',
    description: 'A formal project proposal with objectives, scope, and implementation plan'
  },
  analysis: {
    type: 'analysis',
    description: 'In-depth analysis with data insights, trends, and actionable conclusions'
  },
  strategy: {
    type: 'strategy',
    description: 'Strategic plan with goals, tactics, and implementation roadmap'
  }
};
