// Validator Module - Validates generated Skills

import type { Skill, ValidationResult, ValidationError, ValidationWarning } from './types.js';

export class Validator {
  
  /**
   * Validate a skill
   */
  validate(skill: Skill): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Validate name
    if (!skill.name || skill.name.trim() === '') {
      errors.push({
        field: 'name',
        message: 'Skill name is required'
      });
    } else if (skill.name.length > 50) {
      warnings.push({
        field: 'name',
        message: 'Skill name is quite long, consider shortening'
      });
    }
    
    // Validate description
    if (!skill.description || skill.description.trim() === '') {
      errors.push({
        field: 'description',
        message: 'Skill description is required'
      });
    }
    
    // Validate triggers
    if (skill.triggers.length === 0) {
      warnings.push({
        field: 'triggers',
        message: 'No triggers defined, skill may not be activated'
      });
    }
    
    // Validate steps
    if (skill.steps.length === 0) {
      errors.push({
        field: 'steps',
        message: 'At least one step is required'
      });
    } else {
      skill.steps.forEach((step, index) => {
        if (!step.title || step.title.trim() === '') {
          errors.push({
            field: `steps[${index}].title`,
            message: `Step ${index + 1} title is required`
          });
        }
        if (!step.description || step.description.trim() === '') {
          warnings.push({
            field: `steps[${index}].description`,
            message: `Step ${index + 1} description is empty`
          });
        }
      });
    }
    
    // Validate tools
    if (skill.tools.length === 0) {
      warnings.push({
        field: 'tools',
        message: 'No tools defined, skill may not perform actions'
      });
    }
    
    // Validate examples
    if (skill.examples.length === 0) {
      warnings.push({
        field: 'examples',
        message: 'No examples provided, may affect user understanding'
      });
    } else {
      skill.examples.forEach((example, index) => {
        if (!example.query || example.query.trim() === '') {
          errors.push({
            field: `examples[${index}].query`,
            message: `Example ${index + 1} query is required`
          });
        }
        if (!example.response || example.response.trim() === '') {
          warnings.push({
            field: `examples[${index}].response`,
            message: `Example ${index + 1} response is empty`
          });
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Test skill with sample input
   */
  test(skill: Skill, testInput: string): { success: boolean; matchedSteps: number } {
    let matchedSteps = 0;
    
    // Check if input matches any triggers
    const matched = skill.triggers.some(trigger => 
      testInput.toLowerCase().includes(trigger.toLowerCase())
    );
    
    if (matched) {
      // Count how many steps could potentially execute
      matchedSteps = skill.steps.length;
    }
    
    return {
      success: matched,
      matchedSteps
    };
  }

  /**
   * Print validation results
   */
  printResults(result: ValidationResult): void {
    console.log('\n📋 Validation Results\n');
    
    if (result.valid) {
      console.log('✅ Skill is valid!\n');
    } else {
      console.log('❌ Skill has errors:\n');
      result.errors.forEach(err => {
        console.log(`  - [${err.field}] ${err.message}`);
      });
      console.log('');
    }
    
    if (result.warnings.length > 0) {
      console.log('⚠️  Warnings:\n');
      result.warnings.forEach(warn => {
        console.log(`  - [${warn.field}] ${warn.message}`);
      });
      console.log('');
    }
  }
}

export const validator = new Validator();
