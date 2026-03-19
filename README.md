# SkillForge

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <a href="https://www.npmjs.com/package/skillforge">
    <img src="https://img.shields.io/npm/dm/skillforge" alt="NPM Downloads">
  </a>
</p>

<p align="center">
  <strong>AI-powered Skill generation from PRD, TRD, Source Code</strong>
</p>

---

[English](./README.md) | [中文](./README.zh-CN.md)

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 📄 **Multi-Input Support** | PRD, TRD, Source Code, OpenAPI, Video, Screenshot |
| 🤖 **AI-Enhanced** | LLM-powered skill generation and refinement |
| ⚡ **Fast Generation** | Generate skills in seconds |
| 📦 **Multiple Formats** | OpenClaw, Claude Code, MCP |
| 🔧 **CLI & API** | Command line and programmatic usage |
| 🧪 **Validation** | Built-in skill quality validation |
| 🎨 **Web UI** | Graphical interface (coming soon) |

---

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm install -g skillforge

# Or use npx
npx skillforge generate <input-file>
```

### CLI Usage

```bash
# Generate skill from PRD
skillforge generate examples/login-prd.md -o ./output

# Generate from TRD
skillforge generate examples/order-trd.md -o ./output

# Generate with AI enhancement
skillforge generate input.md --ai

# Validate only
skillforge validate output/SKILL.md

# Create sample PRD
skillforge init my-project
```

### Programmatic Usage

```typescript
import { parser, generator, formatter, validator } from 'skillforge';

const content = await fs.readFile('login-prd.md', 'utf-8');
const parsed = await parser.parse(content);
const skill = await generator.generate(parsed, { includeExamples: true });
const skillMD = formatter.formatSkillMD(skill);
const validation = validator.validate(skill);

console.log(skillMD);
```

---

## 📖 Input Types

### PRD (Product Requirements Document)

```markdown
# 用户登录系统

## 功能需求

### 1. 账号密码登录
- 支持手机号/邮箱登录
- 记住密码功能

## 用户流程

### 登录流程
1. 用户进入登录页面
2. 选择登录方式
3. 输入账号密码
4. 点击登录
5. 登录成功
```

### TRD (Technical Requirements Document)

```markdown
# 订单管理系统

## 接口设计

### POST /api/orders
创建订单

### GET /api/orders/:id
查询订单

## 数据模型

### orders 表
- id: 订单ID
- user_id: 用户ID
- total_amount: 金额
```

### Source Code

```typescript
// React Component
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }) {
  return <button onClick={onClick}>{label}</button>;
}
```

### OpenAPI/Swagger

```yaml
openapi: 3.0.0
paths:
  /api/users:
    get:
      summary: Get users
      responses:
        '200':
          description: OK
```

---

## 📦 Output

### Generated SKILL.md

```markdown
# 用户登录系统 助手

> 提供用户登录相关功能操作引导

## Triggers

- "登录"
- "账号登录"
- "短信登录"

## Steps

### step_1: 用户进入登录页面

引导用户打开登录页面

**Tools:** browser, message

### step_2: 选择登录方式

让用户选择登录方式

**Tools:** prompt, message

## Examples

**User:** 如何登录?
**Assistant:** 好的，让我帮你完成登录操作...
```

---

## 🛠️ Configuration

### skillforge.config.json

```json
{
  "format": "openclaw",
  "includeExamples": true,
  "includeValidation": true,
  "ai": {
    "enabled": false,
    "provider": "openai",
    "model": "gpt-4o-mini"
  }
}
```

---

## 🧪 Development

```bash
# Clone
git clone https://github.com/Yulingsong/skillforge.git
cd skillforge

# Install
npm install

# Build
npm run build

# Dev mode
npm run dev

# Test
npm test
```

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

---

## 📝 License

MIT License
