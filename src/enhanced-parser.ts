// Enhanced Parser with LLM support

import type { 
  ParsedResult, 
  InputType, 
  ExtractedEntity, 
  UserFlow,
  FlowStep,
  FlowInput,
  LLMConfig
} from './types.js';

export class EnhancedParser {
  private llmConfig?: LLMConfig;
  
  constructor(llmConfig?: LLMConfig) {
    this.llmConfig = llmConfig;
  }
  
  /**
   * Parse input with optional AI enhancement
   */
  async parseWithAI(content: string, type?: InputType): Promise<ParsedResult> {
    const baseResult = await this.parse(content, type);
    
    // If LLM is configured, enhance the result
    if (this.llmConfig?.enabled && this.llmConfig?.apiKey) {
      return this.enhanceWithLLM(baseResult);
    }
    
    return baseResult;
  }
  
  /**
   * Enhance parsed result with LLM
   */
  private async enhanceWithLLM(result: ParsedResult): Promise<ParsedResult> {
    if (!this.llmConfig?.apiKey) {
      return result;
    }
    
    const prompt = this.buildEnhancementPrompt(result);
    
    try {
      // Call LLM API (placeholder - implement based on provider)
      const enhancement = await this.callLLM(prompt);
      
      // Merge enhancement into result
      return this.mergeEnhancement(result, enhancement);
    } catch (error) {
      console.warn('LLM enhancement failed, using base result:', error);
      return result;
    }
  }
  
  /**
   * Build prompt for LLM enhancement
   */
  private buildEnhancementPrompt(result: ParsedResult): string {
    return `
Analyze this product requirements and enhance the user flows and entities:

Title: ${result.metadata.title}
Description: ${result.metadata.description}

Current Entities:
${result.entities.map(e => `- ${e.name}: ${e.description}`).join('\n')}

Current User Flows:
${result.userFlows.map(f => `
Flow: ${f.name}
Steps: ${f.steps.map(s => `${s.order}. ${s.title}`).join(', ')}
`).join('\n')}

Please provide:
1. Additional user flows that might be missing
2. More detailed steps for each flow
3. Edge cases and error handling
4. Additional entities or data fields

Respond in JSON format:
{
  "additionalFlows": [{"name": "", "steps": [""]}],
  "enhancedSteps": {"flowId": [{"title": "", "description": "", "errorHandling": ""}]},
  "additionalEntities": [{"name": "", "type": "", "description": ""}]
}
`;
  }
  
  /**
   * Call LLM API
   */
  private async callLLM(prompt: string): Promise<any> {
    // Placeholder - implement based on provider
    const { OpenAI } = await import('openai');
    
    const client = new OpenAI({
      apiKey: this.llmConfig?.apiKey
    });
    
    const response = await client.chat.completions.create({
      model: this.llmConfig?.model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });
    
    return JSON.parse(response.choices[0]?.message?.content || '{}');
  }
  
  /**
   * Merge LLM enhancement into result
   */
  private mergeEnhancement(result: ParsedResult, enhancement: any): ParsedResult {
    const enhanced = { ...result };
    
    // Add additional flows
    if (enhancement.additionalFlows) {
      enhancement.additionalFlows.forEach((flow: any, idx: number) => {
        enhanced.userFlows.push({
          id: `flow_${enhanced.userFlows.length + 1}`,
          name: flow.name,
          description: `${flow.name}，共${flow.steps.length}步`,
          steps: flow.steps.map((title: string, stepIdx: number) => ({
            id: `step_${stepIdx + 1}`,
            order: stepIdx + 1,
            title,
            description: title,
            action: 'process',
            inputs: []
          }))
        });
      });
    }
    
    // Enhance existing steps
    if (enhancement.enhancedSteps) {
      Object.entries(enhancement.enhancedSteps).forEach(([flowId, steps]: [string, any]) => {
        const flow = enhanced.userFlows.find(f => f.id === flowId);
        if (flow) {
          steps.forEach((enhancedStep: any, idx: number) => {
            if (flow.steps[idx]) {
              flow.steps[idx].errorHandling = enhancedStep.errorHandling;
              flow.steps[idx].description = enhancedStep.description || flow.steps[idx].description;
            }
          });
        }
      });
    }
    
    // Add additional entities
    if (enhancement.additionalEntities) {
      enhanced.entities.push(...enhancement.additionalEntities.map((e: any) => ({
        name: e.name,
        type: e.type as any,
        description: e.description
      })));
    }
    
    return enhanced;
  }
  
  /**
   * Parse input content based on detected type
   */
  async parse(content: string, type?: InputType): Promise<ParsedResult> {
    const detectedType = type || this.detectType(content);
    
    switch (detectedType) {
      case 'prd':
        return this.parsePRD(content);
      case 'trd':
        return this.parseTRD(content);
      case 'source':
        return this.parseSource(content);
      case 'api':
        return this.parseAPI(content);
      default:
        return this.parseGeneric(content);
    }
  }

  /**
   * Detect input type from content
   */
  detectType(content: string): InputType {
    const trimmed = content.trim().toLowerCase();
    
    // Check for PRD indicators
    if (
      trimmed.includes('产品需求') || 
      trimmed.includes('# prd') ||
      trimmed.includes('功能需求') ||
      trimmed.includes('用户流程') ||
      trimmed.includes('业务流程')
    ) {
      return 'prd';
    }
    
    // Check for TRD indicators
    if (
      trimmed.includes('技术需求') || 
      trimmed.includes('# trd') ||
      trimmed.includes('接口设计') ||
      trimmed.includes('数据结构') ||
      trimmed.includes('api') && trimmed.includes('module')
    ) {
      return 'trd';
    }
    
    // Check for API (OpenAPI/Swagger)
    if (
      trimmed.startsWith('openapi:') ||
      trimmed.startsWith('swagger:') ||
      trimmed.includes('"paths":') ||
      trimmed.includes('"components":')
    ) {
      return 'api';
    }
    
    // Check for Source Code
    if (
      trimmed.startsWith('import ') ||
      trimmed.startsWith('export ') ||
      trimmed.includes('function ') ||
      trimmed.includes('const ') ||
      trimmed.includes('interface ')
    ) {
      return 'source';
    }
    
    return 'unknown';
  }

  /**
   * Parse Product Requirements Document
   */
  private parsePRD(content: string): ParsedResult {
    const entities: ExtractedEntity[] = [];
    const userFlows: UserFlow[] = [];
    
    const lines = content.split('\n');
    
    // Extract title
    let title = '未命名产品';
    for (const line of lines) {
      const match = line.match(/^#+\s*(.+)/);
      if (match) {
        title = match[1].trim();
        break;
      }
    }
    
    // Extract description (first non-heading paragraph)
    let description = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('#') && line.length > 10) {
        description = line.slice(0, 200);
        break;
      }
    }
    
    // Extract numbered features: ### 1. 账号密码登录
    const featureMatches = content.matchAll(/###\s*[\d]+\.\s*(.+)/g);
    for (const match of featureMatches) {
      const name = match[1].trim();
      if (name) {
        entities.push({
          name,
          type: 'feature',
          description: name
        });
      }
    }
    
    // Extract user flows section (## 用户流程 or ## 业务流程)
    const flowLines: string[] = [];
    let inFlowSection = false;
    let currentFlowName = '';
    let flowContent: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for flow section heading
      if (line.match(/^##\s+(?:用户流程|业务流程|流程)/)) {
        inFlowSection = true;
        continue;
      }
      
      // Check for new section (## that is NOT a flow)
      if (inFlowSection && line.match(/^##\s+/) && !line.match(/^##\s+(?:用户流程|业务流程|流程)/)) {
        // Process the accumulated flow content
        if (flowContent.length > 0 && currentFlowName) {
          this.extractFlowSteps(currentFlowName, flowContent.join('\n'), userFlows);
        }
        inFlowSection = false;
        flowContent = [];
        currentFlowName = '';
        continue;
      }
      
      // Check for flow name (### xxx)
      if (inFlowSection && line.match(/^###\s+/)) {
        // Process previous flow if exists
        if (flowContent.length > 0 && currentFlowName) {
          this.extractFlowSteps(currentFlowName, flowContent.join('\n'), userFlows);
        }
        currentFlowName = line.replace(/^###\s+/, '').trim();
        flowContent = [];
        continue;
      }
      
      // Accumulate content
      if (inFlowSection && currentFlowName) {
        flowContent.push(line);
      }
    }
    
    // Process last flow
    if (flowContent.length > 0 && currentFlowName) {
      this.extractFlowSteps(currentFlowName, flowContent.join('\n'), userFlows);
    }
    
    // Fallback: generate flow from features
    if (userFlows.length === 0 && entities.length > 0) {
      userFlows.push({
        id: 'main_flow',
        name: '主要功能流程',
        description: `${title}的主要功能操作流程`,
        steps: entities.slice(0, 5).map((entity, index) => ({
          id: `step_${index + 1}`,
          order: index + 1,
          title: entity.name,
          description: entity.description,
          action: this.inferAction(entity.name),
          inputs: []
        }))
      });
    }
    
    return {
      type: 'prd',
      content,
      metadata: { title, description },
      entities,
      userFlows
    };
  }

  /**
   * Extract flow steps from flow content
   */
  private extractFlowSteps(flowName: string, content: string, userFlows: UserFlow[]): void {
    const steps: FlowStep[] = [];
    
    // Match numbered steps: 1. xxx or 1) xxx
    const stepRegex = /^\s*(\d+)[\.\)、]\s*(.+)/gm;
    const matches = [...content.matchAll(stepRegex)];
    
    let stepOrder = 0;
    for (const match of matches) {
      stepOrder++;
      const stepTitle = match[2].trim();
      if (stepTitle) {
        steps.push({
          id: `step_${stepOrder}`,
          order: stepOrder,
          title: stepTitle,
          description: stepTitle,
          action: this.inferAction(stepTitle),
          inputs: this.extractInputs(stepTitle)
        });
      }
    }
    
    if (steps.length > 0) {
      userFlows.push({
        id: `flow_${userFlows.length + 1}`,
        name: flowName,
        description: `${flowName}，共${steps.length}步`,
        steps
      });
    }
  }

  /**
   * Parse Technical Requirements Document
   */
  private parseTRD(content: string): ParsedResult {
    const entities: ExtractedEntity[] = [];
    const userFlows: UserFlow[] = [];
    
    // Extract title
    const titleMatch = content.match(/^#+\s*(.+)/);
    const title = titleMatch ? titleMatch[1].trim() : '技术方案';
    
    // Extract APIs
    const apiMatches = content.matchAll(/(GET|POST|PUT|DELETE)\s+(\/[^\s]+)/gi);
    for (const match of apiMatches) {
      entities.push({
        name: `${match[1]} ${match[2]}`,
        type: 'api',
        description: `${match[1]} ${match[2]}`,
        properties: { method: match[1].toUpperCase(), path: match[2] }
      });
    }
    
    // Extract modules
    const moduleMatches = content.matchAll(/###\s*[\d]+\.\s*(.+)/g);
    for (const match of moduleMatches) {
      entities.push({
        name: match[1].trim(),
        type: 'component',
        description: match[1].trim()
      });
    }
    
    // Extract data models
    const dataMatches = content.matchAll(/```(?:json|typescript)\s*\n[\s\S]*?(?:(\w+)\s+)?\{([\s\S]*?)\}/gi);
    for (const match of dataMatches) {
      const tableName = match[1] || 'Table';
      entities.push({
        name: tableName,
        type: 'field',
        description: `数据结构: ${tableName}`
      });
    }
    
    // Generate flow from modules
    if (entities.length > 0) {
      userFlows.push({
        id: 'main_flow',
        name: '模块集成流程',
        description: `${title}的模块集成流程`,
        steps: entities.slice(0, 5).map((entity, index) => ({
          id: `step_${index + 1}`,
          order: index + 1,
          title: entity.name,
          description: entity.description,
          action: 'process',
          inputs: []
        }))
      });
    }
    
    return {
      type: 'trd',
      content,
      metadata: { title },
      entities,
      userFlows
    };
  }

  /**
   * Parse Source Code
   */
  private parseSource(content: string): ParsedResult {
    const entities: ExtractedEntity[] = [];
    const userFlows: UserFlow[] = [];
    
    // Extract functions/components
    const funcMatches = content.matchAll(/(?:export\s+)?(?:function|const|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
    for (const match of funcMatches) {
      const name = match[1];
      if (!['function', 'const', 'class', 'export', 'default'].includes(name)) {
        entities.push({
          name,
          type: 'component',
          description: `${match[0].split(' ')[0]}: ${name}`
        });
      }
    }
    
    // Extract interfaces
    const interfaceMatches = content.matchAll(/interface\s+(\w*Props?\w*)/gi);
    for (const match of interfaceMatches) {
      entities.push({
        name: match[1],
        type: 'field',
        description: `接口: ${match[1]}`
      });
    }
    
    // Extract React/Vue components with props
    const componentMatches = content.matchAll(/(?:function|const)\s+([A-Z][a-zA-Z0-9_]*)\s*(?:=\s*(?:\([^)]*\)|[^=])*?=>|)\s*(?:\([^)]*\))?\s*\{/g);
    for (const match of componentMatches) {
      const componentName = match[1];
      if (componentName && componentName[0] === componentName[0].toUpperCase()) {
        // Extract props if available
        const propsMatch = content.match(new RegExp(`${componentName}\\s*\\(\\s*\\{([^}]+)\\}`, 's'));
        const props = propsMatch ? propsMatch[1].split(',').map(p => p.trim().split(':')[0].replace('?', '')).filter(Boolean) : [];
        
        entities.push({
          name: componentName,
          type: 'component',
          description: `React 组件${props.length > 0 ? `, Props: ${props.join(', ')}` : ''}`,
          properties: { props }
        });
      }
    }
    
    return {
      type: 'source',
      content,
      metadata: { title: '源码分析' },
      entities,
      userFlows
    };
  }

  /**
   * Parse API Definition (OpenAPI/Swagger)
   */
  private parseAPI(content: string): ParsedResult {
    const entities: ExtractedEntity[] = [];
    const userFlows: UserFlow[] = [];
    
    try {
      const json = JSON.parse(content);
      
      if (json.paths) {
        Object.entries(json.paths).forEach(([path, methods]: [string, any]) => {
          Object.entries(methods).forEach(([method, details]: [string, any]) => {
            if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
              entities.push({
                name: `${method.toUpperCase()} ${path}`,
                type: 'api',
                description: details.summary || details.description || '',
                properties: {
                  method: method.toUpperCase(),
                  path,
                  parameters: details.parameters || [],
                  requestBody: details.requestBody
                }
              });
            }
          });
        });
      }
    } catch {
      // Not valid JSON
    }
    
    return {
      type: 'api',
      content,
      metadata: { title: 'API 定义' },
      entities,
      userFlows
    };
  }

  /**
   * Generic fallback parser
   */
  private parseGeneric(content: string): ParsedResult {
    const lines = content.split('\n').filter(l => l.trim());
    const title = lines[0]?.replace(/^#+\s*/, '').trim() || '未命名';
    
    return {
      type: 'unknown',
      content,
      metadata: { title, description: content.slice(0, 200) },
      entities: [],
      userFlows: []
    };
  }

  /**
   * Infer action from step description
   */
  private inferAction(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('输入') || desc.includes('填写') || desc.includes('录入')) {
      return 'input';
    }
    if (desc.includes('点击') || desc.includes('选择') || desc.includes('触发')) {
      return 'click';
    }
    if (desc.includes('提交') || desc.includes('确认') || desc.includes('完成')) {
      return 'submit';
    }
    if (desc.includes('验证') || desc.includes('检查') || desc.includes('校验')) {
      return 'validate';
    }
    if (desc.includes('登录') || desc.includes('注册')) {
      return 'authenticate';
    }
    if (desc.includes('查询') || desc.includes('搜索')) {
      return 'search';
    }
    if (desc.includes('获取') || desc.includes('拉取') || desc.includes('发送')) {
      return 'fetch';
    }
    if (desc.includes('进入') || desc.includes('跳转')) {
      return 'navigate';
    }
    
    return 'process';
  }

  /**
   * Extract inputs from step description
   */
  private extractInputs(description: string): FlowInput[] {
    const inputs: FlowInput[] = [];
    const desc = description.toLowerCase();
    
    if (desc.includes('账号') || desc.includes('用户名') || desc.includes('手机号') || desc.includes('邮箱')) {
      inputs.push({ name: 'account', type: 'text', required: true, placeholder: '请输入账号' });
    }
    if (desc.includes('密码')) {
      inputs.push({ name: 'password', type: 'text', required: true, placeholder: '请输入密码' });
    }
    if (desc.includes('验证码') || desc.includes('短信')) {
      inputs.push({ name: 'code', type: 'text', required: true, placeholder: '请输入验证码' });
    }
    if (desc.includes('选择')) {
      inputs.push({ name: 'selection', type: 'select', required: true, placeholder: '请选择' });
    }
    
    return inputs;
  }
}
