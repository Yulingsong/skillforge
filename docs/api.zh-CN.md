# SkillForge API 参考

## 模块导入

```typescript
import { 
  parser,
  generator,
  formatter,
  validator,
  EnhancedParser,
  createLLMClient,
  LLMProviderFactory
} from 'skillforge';
```

## parser.parse()

解析输入内容。

```typescript
const result = await parser.parse(content, 'prd');

console.log(result.metadata.title);
console.log(result.entities.length);
console.log(result.userFlows.length);
```

**参数:**
- `content: string` - 输入内容
- `type?: InputType` - 输入类型

**返回:** `Promise<ParsedResult>`

### InputType

```typescript
type InputType = 'prd' | 'trd' | 'source' | 'api' | 'video' | 'unknown';
```

## EnhancedParser

支持 AI 增强的解析器。

```typescript
const parser = new EnhancedParser({
  provider: 'openai',
  apiKey: 'sk-xxx',
  model: 'gpt-4o-mini'
});

const result = await parser.parseWithAI(content, 'prd');
```

## generator.generate()

生成 Skill。

```typescript
const skill = await generator.generate(parsed, {
  format: 'openclaw',
  includeExamples: true
});
```

**参数:**
- `parsed: ParsedResult`
- `config: GenerationConfig`

**返回:** `Promise<Skill>`

## formatter.formatSkillMD()

格式化为 SKILL.md。

```typescript
const md = formatter.formatSkillMD(skill);
```

## formatter.formatToolsJSON()

生成工具配置。

```typescript
const tools = formatter.formatToolsJSON(skill);
```

## formatter.formatClaudeCodeSkill()

格式化为 Claude Code 格式。

```typescript
const skill = formatter.formatClaudeCodeSkill(skill);
```

## validator.validate()

验证 Skill。

```typescript
const result = validator.validate(skill);

if (!result.valid) {
  console.log('错误:', result.errors);
}
```

## createLLMClient()

创建 LLM 客户端。

```typescript
const client = createLLMClient({
  provider: 'openai',
  apiKey: 'sk-xxx',
  model: 'gpt-4o-mini'
});
```

## LLMProviderFactory

LLM 提供商工厂。

```typescript
// 获取提供商
const provider = LLMProviderFactory.get('openai');

// 注册新提供商
LLMProviderFactory.register('custom', myProvider);

// 列出所有提供商
console.log(LLMProviderFactory.listProviders());
// ['openai', 'anthropic', 'gemini']
```

## 类型定义

### ParsedResult

```typescript
interface ParsedResult {
  type: InputType;
  content: string;
  metadata: {
    title?: string;
    description?: string;
    version?: string;
  };
  entities: ExtractedEntity[];
  userFlows: UserFlow[];
}
```

### ExtractedEntity

```typescript
interface ExtractedEntity {
  name: string;
  type: 'feature' | 'api' | 'component' | 'field' | 'action';
  description: string;
  properties?: Record<string, any>;
}
```

### UserFlow

```typescript
interface UserFlow {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
}
```

### Skill

```typescript
interface Skill {
  name: string;
  description: string;
  triggers: string[];
  steps: SkillStep[];
  tools: string[];
  examples: Example[];
  references: Reference[];
}
```

### LLMConfig

```typescript
interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'gemini';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}
```

## CLI 用法

```bash
# 生成 Skill
skillforge generate <file> [options]

# 验证 Skill
skillforge validate <file> [options]

# 创建示例
skillforge init [name]

# 启动 Web UI
skillforge serve
```

### 选项

| 选项 | 说明 |
|------|------|
| `-o, --output <dir>` | 输出目录 |
| `-t, --type <type>` | 输入类型 |
| `-f, --format <format>` | 输出格式 |
| `--ai` | 启用 AI |
| `--ai-provider` | AI 提供商 |
| `--ai-model` | AI 模型 |
| `--ai-key` | API Key |
| `--no-examples` | 排除示例 |
| `--no-validation` | 跳过验证 |
