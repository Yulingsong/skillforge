// Formatter Module - Formats Skill to SKILL.md

import type { Skill } from './types.js';

export class Formatter {
  
  /**
   * Format skill to SKILL.md content
   */
  formatSkillMD(skill: Skill): string {
    let output = '';
    
    // Header
    output += `# ${skill.name}\n\n`;
    output += `> ${skill.description}\n\n`;
    
    // Triggers
    if (skill.triggers.length > 0) {
      output += `## Triggers\n\n`;
      output += skill.triggers.map(t => `- "${t}"`).join('\n');
      output += '\n\n';
    }
    
    // Steps
    if (skill.steps.length > 0) {
      output += `## Steps\n\n`;
      skill.steps.forEach(step => {
        output += `### ${step.id}: ${step.title}\n\n`;
        output += `${step.description}\n\n`;
        
        if (step.tools.length > 0) {
          output += `**Tools:** ${step.tools.join(', ')}\n\n`;
        }
        
        if (step.validation) {
          output += `**Validation:** ${step.validation}\n\n`;
        }
        
        if (step.errorHandling) {
          output += `**Error Handling:** ${step.errorHandling}\n\n`;
        }
      });
    }
    
    // Examples
    if (skill.examples.length > 0) {
      output += `## Examples\n\n`;
      skill.examples.forEach(example => {
        output += `**User:** ${example.query}\n\n`;
        output += `**Assistant:** ${example.response}\n\n`;
        output += `---\n\n`;
      });
    }
    
    // Tools
    if (skill.tools.length > 0) {
      output += `## Available Tools\n\n`;
      output += `${skill.tools.join(', ')}\n\n`;
    }
    
    // References
    if (skill.references.length > 0) {
      output += `## References\n\n`;
      skill.references.forEach(ref => {
        output += `### ${ref.title}\n\n`;
        output += ref.content;
        output += '\n\n';
      });
    }
    
    return output;
  }

  /**
   * Format skill to Claude Code skill format
   */
  formatClaudeCodeSkill(skill: Skill): string {
    let output = '';
    
    output += `# ${skill.name}\n\n`;
    output += `${skill.description}\n\n`;
    output += `---\n\n`;
    
    // Instructions
    output += `## Instructions\n\n`;
    output += `You are an AI assistant that helps users with ${skill.name}.\n\n`;
    output += `When invoked, follow these steps:\n\n`;
    
    skill.steps.forEach((step, index) => {
      output += `${index + 1}. **${step.title}**\n`;
      output += `   - ${step.description}\n`;
      if (step.validation) {
        output += `   - Validate: ${step.validation}\n`;
      }
      output += '\n';
    });
    
    // Tools
    output += `\n## Tools\n\n`;
    output += `You have access to the following tools:\n\n`;
    skill.tools.forEach(tool => {
      output += `- ${tool}\n`;
    });
    
    // Examples
    if (skill.examples.length > 0) {
      output += `\n## Examples\n\n`;
      skill.examples.forEach(example => {
        output += `User: ${example.query}\n`;
        output += `Assistant: ${example.response}\n\n`;
      });
    }
    
    return output;
  }

  /**
   * Generate tools.json
   */
  formatToolsJSON(skill: Skill): string {
    const tools = skill.tools.map(tool => ({
      name: tool,
      description: this.getToolDescription(tool),
      enabled: true
    }));
    
    return JSON.stringify({ tools }, null, 2);
  }

  /**
   * Get tool description
   */
  private getToolDescription(tool: string): string {
    const descriptions: Record<string, string> = {
      message: 'Send messages to user',
      prompt: 'Get user input',
      browser: 'Control browser for web interactions',
      http: 'Make HTTP requests',
      api: 'Call APIs',
      auth: 'Handle authentication',
      read: 'Read files',
      write: 'Write files',
      exec: 'Execute shell commands'
    };
    
    return descriptions[tool] || `${tool} tool`;
  }

  /**
   * Generate package.json for skill
   */
  formatPackageJSON(skill: Skill): string {
    const name = skill.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    
    return JSON.stringify({
      name: `skill-${name}`,
      version: '1.0.0',
      description: skill.description,
      main: 'skill.md',
      keywords: ['skill', ...skill.triggers.slice(0, 5)],
      author: '',
      license: 'MIT'
    }, null, 2);
  }

  /**
   * Generate references as files
   */
  formatReferences(skill: Skill): Record<string, string> {
    const files: Record<string, string> = {};
    
    skill.references.forEach((ref, index) => {
      let filename = ref.title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')  // Support Chinese
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Ensure filename is not empty
      if (!filename || filename.length < 2) {
        filename = `reference-${index + 1}`;
      }
      
      files[`${filename}.${ref.type === 'markdown' ? 'md' : 'txt'}`] = ref.content;
    });
    
    return files;
  }
}

export const formatter = new Formatter();
