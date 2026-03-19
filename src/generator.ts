// Generator Module - Generates Skill from parsed content

import type { 
  ParsedResult, 
  GenerationConfig, 
  Skill,
  SkillStep,
  Example,
  Reference
} from './types.js';

export class Generator {
  
  /**
   * Generate Skill from parsed result
   */
  async generate(
    parsed: ParsedResult, 
    config: GenerationConfig
  ): Promise<Skill> {
    const skillName = this.generateName(parsed);
    const description = this.generateDescription(parsed);
    const triggers = this.generateTriggers(parsed);
    const steps = this.generateSteps(parsed);
    const examples = config.includeExamples ? this.generateExamples(parsed) : [];
    const references = config.includeExamples ? this.generateReferences(parsed) : [];
    const tools = this.inferTools(parsed);
    
    return {
      name: skillName,
      description,
      triggers,
      steps,
      tools,
      examples,
      references
    };
  }

  /**
   * Generate skill name from parsed content
   */
  private generateName(parsed: ParsedResult): string {
    const metadata = parsed.metadata;
    
    if (metadata.title) {
      // Clean up title and add appropriate suffix
      let name = metadata.title
        .replace(/产品需求|技术需求|PRD|TRD/, '')
        .trim();
      
      // Add suffix based on type
      switch (parsed.type) {
        case 'prd':
          return `${name}助手`;
        case 'trd':
          return `${name}集成`;
        case 'source':
          return `${name}使用指南`;
        case 'api':
          return `${name}调用`;
        default:
          return name;
      }
    }
    
    // Fallback names based on entities
    if (parsed.entities.length > 0) {
      return `${parsed.entities[0].name}助手`;
    }
    
    return '通用助手';
  }

  /**
   * Generate description
   */
  private generateDescription(parsed: ParsedResult): string {
    const metadata = parsed.metadata;
    
    if (metadata.description) {
      return metadata.description;
    }
    
    // Generate from user flows
    if (parsed.userFlows.length > 0) {
      const mainFlow = parsed.userFlows[0];
      return `帮助用户完成${mainFlow.name}。包含${mainFlow.steps.length}个步骤。`;
    }
    
    // Generate from entities
    if (parsed.entities.length > 0) {
      const features = parsed.entities.slice(0, 3).map(e => e.name).join('、');
      return `提供${features}等功能。`;
    }
    
    return '提供相关功能操作引导。';
  }

  /**
   * Generate trigger keywords
   */
  private generateTriggers(parsed: ParsedResult): string[] {
    const triggers: string[] = [];
    
    // Add name-based triggers
    const name = parsed.metadata.title || '';
    if (name) {
      triggers.push(name);
      // Add key parts
      const parts = name.split(/[、,\s]/).filter(p => p.length > 1);
      triggers.push(...parts.slice(0, 3));
    }
    
    // Add entity-based triggers
    parsed.entities.forEach(entity => {
      if (entity.type === 'feature' || entity.type === 'action') {
        triggers.push(entity.name);
      }
    });
    
    // Add flow-based triggers
    parsed.userFlows.forEach(flow => {
      triggers.push(flow.name);
      flow.steps.forEach(step => {
        if (step.title.length > 2 && step.title.length < 10) {
          triggers.push(step.title);
        }
      });
    });
    
    // Deduplicate and limit
    return [...new Set(triggers)].slice(0, 10);
  }

  /**
   * Generate skill steps
   */
  private generateSteps(parsed: ParsedResult): SkillStep[] {
    const steps: SkillStep[] = [];
    
    // Use user flows if available
    if (parsed.userFlows.length > 0) {
      parsed.userFlows[0].steps.forEach((flowStep, index) => {
        steps.push({
          id: flowStep.id,
          title: flowStep.title,
          description: flowStep.description,
          tools: this.inferStepTools(flowStep.action),
          validation: flowStep.validation,
          errorHandling: flowStep.errorHandling || this.defaultErrorHandling(flowStep.action)
        });
      });
    } else {
      // Generate steps from entities
      parsed.entities.slice(0, 5).forEach((entity, index) => {
        steps.push({
          id: `step_${index + 1}`,
          title: `执行${entity.name}`,
          description: entity.description,
          tools: ['message', 'prompt'],
          validation: undefined,
          errorHandling: '提示用户检查输入后重试'
        });
      });
    }
    
    return steps;
  }

  /**
   * Generate examples
   */
  private generateExamples(parsed: ParsedResult): Example[] {
    const examples: Example[] = [];
    const name = parsed.metadata.title || '功能';
    
    // Generate common examples
    const commonExamples = [
      {
        query: `如何使用${name}?`,
        response: this.generateResponse(parsed, 1)
      },
      {
        query: `帮我完成${name}`,
        response: this.generateResponse(parsed, 2)
      },
      {
        query: `${name}怎么操作?`,
        response: this.generateResponse(parsed, 3)
      }
    ];
    
    examples.push(...commonExamples);
    return examples;
  }

  /**
   * Generate example response
   */
  private generateResponse(parsed: ParsedResult, stepNumber: number): string {
    if (parsed.userFlows.length > 0 && parsed.userFlows[0].steps.length >= stepNumber) {
      const step = parsed.userFlows[0].steps[stepNumber - 1];
      return `好的，让我们开始${step.title}。${step.description}`;
    }
    
    return `好的，我来帮你完成这个操作。`;
  }

  /**
   * Generate references
   */
  private generateReferences(parsed: ParsedResult): Reference[] {
    const references: Reference[] = [];
    
    // Add usage guide
    references.push({
      title: '使用说明',
      content: this.generateUsageGuide(parsed),
      type: 'markdown'
    });
    
    // Add API reference if available
    const apis = parsed.entities.filter(e => e.type === 'api');
    if (apis.length > 0) {
      references.push({
        title: 'API 参考',
        content: apis.map(a => `- ${a.name}: ${a.description}`).join('\n'),
        type: 'text'
      });
    }
    
    return references;
  }

  /**
   * Generate usage guide
   */
  private generateUsageGuide(parsed: ParsedResult): string {
    let guide = `# ${parsed.metadata.title || '功能'}使用指南\n\n`;
    
    if (parsed.metadata.description) {
      guide += `${parsed.metadata.description}\n\n`;
    }
    
    if (parsed.userFlows.length > 0) {
      guide += `## 操作步骤\n\n`;
      parsed.userFlows[0].steps.forEach((step, index) => {
        guide += `${index + 1}. ${step.title}\n`;
        guide += `   - ${step.description}\n`;
        if (step.inputs.length > 0) {
          guide += `   - 需要输入: ${step.inputs.map(i => i.name).join(', ')}\n`;
        }
      });
    }
    
    guide += `\n## 注意事项\n\n`;
    guide += `- 请按照步骤顺序操作\n`;
    guide += `- 如遇问题请查看错误提示\n`;
    
    return guide;
  }

  /**
   * Infer required tools
   */
  private inferTools(parsed: ParsedResult): string[] {
    const tools = new Set<string>(['message', 'prompt']);
    
    // Add tools based on entities
    parsed.entities.forEach(entity => {
      switch (entity.type) {
        case 'api':
          tools.add('http');
          tools.add('api');
          break;
        case 'component':
          tools.add('browser');
          break;
        case 'action':
          if (entity.name.includes('登录') || entity.name.includes('认证')) {
            tools.add('auth');
          }
          break;
      }
    });
    
    // Add tools based on user flows
    parsed.userFlows.forEach(flow => {
      flow.steps.forEach(step => {
        const stepTools = this.inferStepTools(step.action);
        stepTools.forEach(t => tools.add(t));
      });
    });
    
    return [...tools];
  }

  /**
   * Infer tools for a step
   */
   private inferStepTools(action: string): string[] {
    switch (action) {
      case 'input':
        return ['prompt'];
      case 'click':
        return ['browser'];
      case 'submit':
        return ['http', 'message'];
      case 'validate':
        return ['message'];
      case 'authenticate':
        return ['http', 'prompt'];
      case 'search':
        return ['browser', 'http'];
      case 'fetch':
        return ['http'];
      default:
        return ['message', 'prompt'];
    }
  }

  /**
   * Default error handling
   */
  private defaultErrorHandling(action: string): string {
    switch (action) {
      case 'input':
        return '提示用户检查输入格式是否正确';
      case 'submit':
        return '提示用户检查网络连接或稍后重试';
      case 'authenticate':
        return '提示用户检查账号密码是否正确';
      default:
        return '提示用户检查后重试';
    }
  }
}

export const generator = new Generator();
