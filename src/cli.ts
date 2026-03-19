#!/usr/bin/env node

// SkillForge CLI

import { Command } from 'commander';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import picocolors from 'picocolors';

import { parser } from './parser.js';
import { generator } from './generator.js';
import { formatter } from './formatter.js';
import { validator } from './validator.js';
import type { Skill, GenerationConfig, InputType } from './types.js';

const program = new Command();

program
  .name('skillforge')
  .description('AI-powered Skill generation from PRD, TRD, Source Code')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate a Skill from input file')
  .argument('<input>', 'Input file (PRD, TRD, Source, or API)')
  .option('-o, --output <dir>', 'Output directory', './skill-output')
  .option('-t, --type <type>', 'Input type (prd, trd, source, api)', 'auto')
  .option('-f, --format <format>', 'Output format (openclaw, claude-code)', 'openclaw')
  .option('--no-examples', 'Exclude examples')
  .option('--no-validation', 'Skip validation')
  .option('--validate-only', 'Only validate input without generating')
  .action(async (inputFile: string, options) => {
    try {
      console.log(picocolors.blue('🔧 SkillForge - AI Skill Generator\n'));
      
      // Read input file
      const inputPath = resolve(inputFile);
      if (!existsSync(inputPath)) {
        console.error(picocolors.red(`❌ File not found: ${inputPath}`));
        process.exit(1);
      }
      
      const content = readFileSync(inputPath, 'utf-8');
      console.log(picocolors.gray(`📄 Loaded: ${inputFile}`));
      
      // Detect or use specified type
      const inputType = options.type === 'auto' 
        ? parser.detectType(content) 
        : options.type as InputType;
      
      console.log(picocolors.gray(`🔍 Detected type: ${inputType}`));
      
      // Parse
      console.log(picocolors.gray('🧠 Parsing content...\n'));
      const parsed = await parser.parse(content, inputType);
      
      console.log(picocolors.green(`✅ Parsed successfully`));
      console.log(picocolors.gray(`   Title: ${parsed.metadata.title || 'N/A'}`));
      console.log(picocolors.gray(`   Entities: ${parsed.entities.length}`));
      console.log(picocolors.gray(`   User Flows: ${parsed.userFlows.length}\n`));
      
      if (options.validateOnly) {
        console.log(picocolors.blue('✓ Validation only mode - skipping generation'));
        process.exit(0);
      }
      
      // Generate config
      const config: GenerationConfig = {
        format: options.format as 'openclaw' | 'claude-code',
        includeExamples: options.examples,
        includeValidation: options.validation
      };
      
      // Generate
      console.log(picocolors.gray('🤖 Generating Skill...\n'));
      const skill = await generator.generate(parsed, config);
      
      console.log(picocolors.green(`✅ Generated: ${skill.name}`));
      console.log(picocolors.gray(`   Triggers: ${skill.triggers.length}`));
      console.log(picocolors.gray(`   Steps: ${skill.steps.length}`));
      console.log(picocolors.gray(`   Tools: ${skill.tools.length}\n`));
      
      // Validate
      if (options.validation) {
        const validation = validator.validate(skill);
        validator.printResults(validation);
        
        if (!validation.valid) {
          console.log(picocolors.yellow('⚠️  Generated with errors - proceed with caution\n'));
        }
      }
      
      // Output
      const outputDir = resolve(options.output);
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      
      // Write SKILL.md
      const skillContent = options.format === 'claude-code'
        ? formatter.formatClaudeCodeSkill(skill)
        : formatter.formatSkillMD(skill);
      
      writeFileSync(join(outputDir, 'SKILL.md'), skillContent);
      console.log(picocolors.green(`✅ Written: ${join(outputDir, 'SKILL.md')}`));
      
      // Write tools.json
      const toolsContent = formatter.formatToolsJSON(skill);
      writeFileSync(join(outputDir, 'tools.json'), toolsContent);
      console.log(picocolors.green(`✅ Written: ${join(outputDir, 'tools.json')}`));
      
      // Write package.json
      const packageContent = formatter.formatPackageJSON(skill);
      writeFileSync(join(outputDir, 'package.json'), packageContent);
      console.log(picocolors.green(`✅ Written: ${join(outputDir, 'package.json')}`));
      
      // Write references
      const references = formatter.formatReferences(skill);
      Object.entries(references).forEach(([filename, content]) => {
        const refDir = join(outputDir, 'references');
        if (!existsSync(refDir)) {
          mkdirSync(refDir, { recursive: true });
        }
        writeFileSync(join(refDir, filename), content);
        console.log(picocolors.green(`✅ Written: ${join(refDir, filename)}`));
      });
      
      console.log(picocolors.blue('\n🎉 Skill generation complete!\n'));
      console.log(picocolors.gray(`   Output directory: ${outputDir}`));
      console.log(picocolors.gray(`   Next steps:`));
      console.log(picocolors.gray(`   1. Review SKILL.md`));
      console.log(picocolors.gray(`   2. Customize as needed`));
      console.log(picocolors.gray(`   3. Copy to your AI agent's skills folder\n`));
      
    } catch (error) {
      console.error(picocolors.red(`\n❌ Error: ${error}`));
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Create a sample PRD for testing')
  .argument('[name]', 'Project name', 'my-project')
  .action((name: string) => {
    const samplePRD = `# ${name} 产品需求文档

## 概述
这是一个示例产品需求文档，用于演示 SkillForge 的功能。

## 功能需求

### 用户登录
- 支持手机号登录
- 支持邮箱登录
- 支持第三方登录（微信、Google）

### 用户注册
- 手机号注册
- 邮箱注册
- 验证码验证

### 个人信息
- 查看个人信息
- 修改昵称
- 修改头像
- 修改密码

## 业务流程

### 登录流程
1. 选择登录方式
2. 输入账号信息
3. 输入密码或验证码
4. 点击登录
5. 登录成功，跳转首页

### 注册流程
1. 选择注册方式
2. 输入手机号/邮箱
3. 获取验证码
4. 输入验证码
5. 设置密码
6. 完成注册

## 数据实体

### 用户
- id: 用户ID
- username: 用户名
- email: 邮箱
- phone: 手机号
- avatar: 头像
- createdAt: 创建时间
`;

    console.log(picocolors.green(`📄 Generated sample PRD: ${name}.md\n`));
    writeFileSync(`${name}.md`, samplePRD);
    console.log(picocolors.blue(`   Run: skillforge generate ${name}.md\n`));
  });

program.parse();
