
export type PredefinedFormat = 'detailed-report' | 'prd' | 'project-proposal' | 'strategic-plan' | 'business-case' | 'other';

export interface OutputFormat {
  type: PredefinedFormat;
  customFormat?: string;
  description: string;
}

export const OUTPUT_FORMATS: Record<Exclude<PredefinedFormat, 'other'>, OutputFormat> = {
  'detailed-report': {
    type: 'detailed-report',
    description: 'Detailed Report'
  },
  'prd': {
    type: 'prd',
    description: 'Product Requirements Document'
  },
  'project-proposal': {
    type: 'project-proposal',
    description: 'Project Proposal'
  },
  'strategic-plan': {
    type: 'strategic-plan',
    description: 'Strategic Plan'
  },
  'business-case': {
    type: 'business-case',
    description: 'Business Case'
  }
};
