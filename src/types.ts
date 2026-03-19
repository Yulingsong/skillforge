// SkillForge Type Definitions

export interface ParsedResult {
  type: InputType;
  content: string;
  metadata: {
    title?: string;
    description?: string;
    version?: string;
    author?: string;
  };
  entities: ExtractedEntity[];
  userFlows: UserFlow[];
}

export type InputType = 'prd' | 'trd' | 'source' | 'api' | 'video' | 'unknown';

export interface ExtractedEntity {
  name: string;
  type: 'feature' | 'api' | 'component' | 'field' | 'action';
  description: string;
  properties?: Record<string, any>;
}

export interface UserFlow {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
  conditions?: FlowCondition[];
}

export interface FlowStep {
  id: string;
  order: number;
  title: string;
  description: string;
  action: string;
  inputs: FlowInput[];
  outputs?: FlowOutput[];
  validation?: string;
  errorHandling?: string;
}

export interface FlowInput {
  name: string;
  type: 'text' | 'select' | 'file' | 'confirm';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface FlowOutput {
  type: 'message' | 'action' | 'data';
  content: string;
}

export interface FlowCondition {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'not_equals';
  value: string;
  nextStep: string;
}

export interface GenerationConfig {
  format: 'openclaw' | 'claude-code' | 'mcp';
  includeExamples: boolean;
  includeValidation: boolean;
  customTemplate?: string;
}

export interface Skill {
  name: string;
  description: string;
  triggers: string[];
  steps: SkillStep[];
  tools: string[];
  examples: Example[];
  references: Reference[];
}

export interface SkillStep {
  id: string;
  title: string;
  description: string;
  tools: string[];
  validation?: string;
  errorHandling?: string;
}

export interface Example {
  query: string;
  response: string;
}

export interface Reference {
  title: string;
  content: string;
  type: 'markdown' | 'json' | 'text';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

// LLM Types
export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'gemini';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enabled?: boolean; // For backward compatibility
}

export interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
