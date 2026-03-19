// SkillForge Test Cases

import { describe, it, expect } from 'vitest';
import { parser } from '../src/parser.js';
import { generator } from '../src/generator.js';
import { formatter } from '../src/formatter.js';
import { validator } from '../src/validator.js';

describe('Parser', () => {
  
  describe('detectType', () => {
    it('should detect PRD type', () => {
      const content = '# 产品需求文档\n## 功能需求\n### 1. 用户登录';
      expect(parser.detectType(content)).toBe('prd');
    });
    
    it('should detect TRD type', () => {
      const content = '# 技术需求文档\n## 接口设计\nPOST /api/login';
      expect(parser.detectType(content)).toBe('trd');
    });
    
    it('should detect API type', () => {
      const content = '{"openapi": "3.0", "paths": {}}';
      expect(parser.detectType(content)).toBe('api');
    });
    
    it('should detect Source type', () => {
      const content = 'import React from "react";\nexport function Button() {}';
      expect(parser.detectType(content)).toBe('source');
    });
  });
  
  describe('parsePRD', () => {
    it('should parse PRD with user flows', async () => {
      const content = `# 用户登录系统

## 用户流程

### 登录流程
1. 用户进入登录页面
2. 输入账号密码
3. 点击登录
4. 登录成功
`;
      const result = await parser.parse(content, 'prd');
      
      expect(result.metadata.title).toBe('用户登录系统');
      expect(result.userFlows.length).toBeGreaterThan(0);
      expect(result.userFlows[0].steps.length).toBe(4);
    });
    
    it('should parse PRD with features', async () => {
      const content = `# 产品

## 功能需求

### 1. 功能A
### 2. 功能B
`;
      const result = await parser.parse(content, 'prd');
      
      expect(result.entities.length).toBe(2);
    });
  });
  
  describe('parseTRD', () => {
    it('should parse TRD with APIs', async () => {
      const content = `# 技术文档

## 接口设计

POST /api/login
GET /api/users
`;
      const result = await parser.parse(content, 'trd');
      
      expect(result.entities.length).toBeGreaterThan(0);
    });
  });
  
  describe('parseAPI', () => {
    it('should parse OpenAPI JSON', async () => {
      const content = JSON.stringify({
        paths: {
          '/api/login': {
            post: { summary: 'Login' }
          }
        }
      });
      
      const result = await parser.parse(content, 'api');
      
      expect(result.entities.length).toBe(1);
      expect(result.entities[0].type).toBe('api');
    });
  });
  
  describe('parseSource', () => {
    it('should parse React component', async () => {
      const content = `
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
`;
      const result = await parser.parse(content, 'source');
      
      expect(result.entities.length).toBeGreaterThan(0);
    });
  });
});

describe('Generator', () => {
  
  it('should generate skill from PRD', async () => {
    const content = `# 测试产品

## 用户流程

### 测试流程
1. 步骤一
2. 步骤二
3. 步骤三
`;
    const parsed = await parser.parse(content, 'prd');
    const skill = await generator.generate(parsed, {
      format: 'openclaw',
      includeExamples: true,
      includeValidation: true
    });
    
    expect(skill.name).toBeTruthy();
    expect(skill.triggers.length).toBeGreaterThan(0);
    expect(skill.steps.length).toBeGreaterThan(0);
    expect(skill.tools.length).toBeGreaterThan(0);
  });
  
  it('should generate examples when enabled', async () => {
    const content = `# 产品\n\n## 用户流程\n### 流程\n1. 第一步`;
    const parsed = await parser.parse(content, 'prd');
    const skill = await generator.generate(parsed, {
      format: 'openclaw',
      includeExamples: true,
      includeValidation: false
    });
    
    expect(skill.examples.length).toBeGreaterThan(0);
  });
  
  it('should not generate examples when disabled', async () => {
    const content = `# 产品\n\n## 用户流程\n### 流程\n1. 第一步`;
    const parsed = await parser.parse(content, 'prd');
    const skill = await generator.generate(parsed, {
      format: 'openclaw',
      includeExamples: false,
      includeValidation: false
    });
    
    expect(skill.examples.length).toBe(0);
  });
});

describe('Formatter', () => {
  
  it('should format skill to SKILL.md', () => {
    const skill = {
      name: '测试助手',
      description: '测试描述',
      triggers: ['触发词1', '触发词2'],
      steps: [
        {
          id: 'step_1',
          title: '步骤一',
          description: '步骤描述',
          tools: ['message', 'prompt'],
          validation: '验证条件',
          errorHandling: '错误处理'
        }
      ],
      tools: ['message', 'prompt'],
      examples: [
        { query: '问1', response: '答1' }
      ],
      references: [
        { title: '参考', content: '内容', type: 'markdown' }
      ]
    };
    
    const output = formatter.formatSkillMD(skill);
    
    expect(output).toContain('# 测试助手');
    expect(output).toContain('触发词1');
    expect(output).toContain('步骤一');
    expect(output).toContain('message, prompt');
  });
  
  it('should format skill to Claude Code format', () => {
    const skill = {
      name: '测试助手',
      description: '测试描述',
      triggers: ['触发词'],
      steps: [
        { id: 'step_1', title: '步骤', description: '描述', tools: ['message'], validation: undefined, errorHandling: undefined }
      ],
      tools: ['message'],
      examples: [],
      references: []
    };
    
    const output = formatter.formatClaudeCodeSkill(skill);
    
    expect(output).toContain('## Instructions');
    expect(output).toContain('## Tools');
  });
  
  it('should generate tools.json', () => {
    const skill = {
      name: '测试',
      description: '',
      triggers: [],
      steps: [],
      tools: ['message', 'browser', 'http'],
      examples: [],
      references: []
    };
    
    const output = formatter.formatToolsJSON(skill);
    const parsed = JSON.parse(output);
    
    expect(parsed.tools).toHaveLength(3);
    expect(parsed.tools[0].name).toBe('message');
  });
  
  it('should generate package.json', () => {
    const skill = {
      name: '我的助手',
      description: '描述',
      triggers: [],
      steps: [],
      tools: [],
      examples: [],
      references: []
    };
    
    const output = formatter.formatPackageJSON(skill);
    const parsed = JSON.parse(output);
    
    expect(parsed.name).toBeTruthy();
    expect(parsed.description).toBe('描述');
  });
});

describe('Validator', () => {
  
  it('should validate valid skill', () => {
    const skill = {
      name: '有效技能',
      description: '这是一个有效的技能',
      triggers: ['触发词'],
      steps: [
        { id: 'step_1', title: '步骤', description: '描述', tools: ['message'], validation: undefined, errorHandling: undefined }
      ],
      tools: ['message'],
      examples: [
        { query: '问', response: '答' }
      ],
      references: []
    };
    
    const result = validator.validate(skill);
    
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
  
  it('should detect missing name', () => {
    const skill = {
      name: '',
      description: '描述',
      triggers: [],
      steps: [],
      tools: [],
      examples: [],
      references: []
    };
    
    const result = validator.validate(skill);
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'name')).toBe(true);
  });
  
  it('should detect missing steps', () => {
    const skill = {
      name: '技能',
      description: '描述',
      triggers: [],
      steps: [],
      tools: [],
      examples: [],
      references: []
    };
    
    const result = validator.validate(skill);
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'steps')).toBe(true);
  });
  
  it('should warn about missing triggers', () => {
    const skill = {
      name: '技能',
      description: '描述',
      triggers: [],
      steps: [
        { id: 'step_1', title: '步骤', description: '描述', tools: [], validation: undefined, errorHandling: undefined }
      ],
      tools: [],
      examples: [],
      references: []
    };
    
    const result = validator.validate(skill);
    
    expect(result.warnings.some(w => w.field === 'triggers')).toBe(true);
  });
  
  it('should test skill with input', () => {
    const skill = {
      name: '登录助手',
      description: '',
      triggers: ['登录', '账号密码'],
      steps: [],
      tools: [],
      examples: [],
      references: []
    };
    
    const result = validator.test(skill, '我想登录账号');
    
    expect(result.success).toBe(true);
  });
});
