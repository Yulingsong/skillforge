#!/usr/bin/env node

// SkillForge CLI - Enhanced version

import { Command } from 'commander';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import picocolors from 'picocolors';

import { parser } from './parser.js';
import { EnhancedParser } from './enhanced-parser.js';
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
  .option('--ai', 'Enable AI enhancement')
  .option('--ai-provider <provider>', 'AI provider (openai, anthropic, gemini)', 'openai')
  .option('--ai-model <model>', 'AI model', 'gpt-4o-mini')
  .option('--ai-key <key>', 'AI API key')
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
      
      // Parse (with AI enhancement if enabled)
      console.log(picocolors.gray('🧠 Parsing content...\n'));
      
      let parsed;
      if (options.ai && options.aiKey) {
        console.log(picocolors.gray(`🤖 AI Enhancement: Enabled`));
        console.log(picocolors.gray(`   Provider: ${options.aiProvider}`));
        console.log(picocolors.gray(`   Model: ${options.aiModel}\n`));
        
        const enhancedParser = new EnhancedParser({
          provider: options.aiProvider,
          apiKey: options.aiKey,
          model: options.aiModel
        });
        parsed = await enhancedParser.parseWithAI(content, inputType);
      } else {
        parsed = await parser.parse(content, inputType);
      }
      
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
      Object.entries(references).forEach(([filename, fileContent]) => {
        const refDir = join(outputDir, 'references');
        if (!existsSync(refDir)) {
          mkdirSync(refDir, { recursive: true });
        }
        writeFileSync(join(refDir, filename), fileContent);
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
  .command('validate')
  .description('Validate a generated Skill')
  .argument('<file>', 'SKILL.md file to validate')
  .option('--test <query>', 'Test with sample input')
  .action(async (skillFile: string, options) => {
    try {
      console.log(picocolors.blue('🔧 SkillForge - Skill Validator\n'));
      
      const filePath = resolve(skillFile);
      if (!existsSync(filePath)) {
        console.error(picocolors.red(`❌ File not found: ${filePath}`));
        process.exit(1);
      }
      
      const content = readFileSync(filePath, 'utf-8');
      
      // Parse SKILL.md to extract skill info
      // For now, we'll do basic validation
      console.log(picocolors.gray(`📄 Validating: ${skillFile}\n`));
      
      // Basic checks
      const hasTitle = content.includes('# ');
      const hasTriggers = content.includes('## Triggers') || content.includes('## Triggers');
      const hasSteps = content.includes('## Steps') || content.includes('## Steps');
      
      console.log(picocolors.gray('📋 Basic Checks:'));
      console.log(`   Title: ${hasTitle ? '✅' : '❌'}`);
      console.log(`   Triggers: ${hasTriggers ? '✅' : '❌'}`);
      console.log(`   Steps: ${hasSteps ? '✅' : '❌'}\n`);
      
      if (!hasTitle || !hasTriggers || !hasSteps) {
        console.log(picocolors.yellow('⚠️  SKILL.md may not be valid\n'));
      } else {
        console.log(picocolors.green('✅ SKILL.md appears valid\n'));
      }
      
      // Test with query if provided
      if (options.test) {
        console.log(picocolors.gray(`🧪 Testing with: "${options.test}"`));
        console.log(picocolors.yellow('   (Test functionality coming soon)\n'));
      }
      
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

### 1. 用户登录
- 支持手机号登录
- 支持邮箱登录
- 支持第三方登录（微信、Google）

### 2. 用户注册
- 手机号注册
- 邮箱注册
- 验证码验证

### 3. 个人信息
- 查看个人信息
- 修改昵称
- 修改头像
- 修改密码

## 用户流程

### 登录流程
1. 用户进入登录页面
2. 选择登录方式
3. 输入账号信息
4. 点击登录按钮
5. 系统验证
6. 登录成功跳转首页

### 注册流程
1. 用户进入注册页面
2. 选择注册方式
3. 填写基本信息
4. 获取并输入验证码
5. 设置密码
6. 完成注册，自动登录

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

program
  .command('serve')
  .description('Start web UI server (coming soon)')
  .option('-p, --port <port>', 'Port number', '3000')
  .action((options) => {
    console.log(picocolors.yellow('\n🛠️  Web UI coming soon!\n'));
    console.log(picocolors.gray('   For now, use CLI:'));
    console.log(picocolors.gray('   $ skillforge generate <input> -o <output>\n'));
  });

program.parse();
