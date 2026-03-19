# SkillForge 中文文档

> AI 驱动的自动化技能生成工具

[English](./README.en.md) | 中文

## 什么是 SkillForge？

SkillForge 是一个能从产品需求文档（PRD）、技术需求文档（TRD）、源代码等自动生成 AI Skill 的工具。

### 核心价值

- **开发者**: 开发完功能后，一键生成配套的 Skill
- **产品经理**: 快速生成功能操作指引
- **终端用户**: 通过 Skill 引导完成专业操作

## 特性

| 特性 | 说明 |
|------|------|
| 📄 多输入支持 | PRD、TRD、源代码、OpenAPI、视频、截图 |
| 🤖 AI 增强 | 支持 OpenAI、Anthropic Claude、Google Gemini |
| ⚡ 快速生成 | 秒级生成 Skill |
| 📦 多种格式 | OpenClaw、Claude Code、MCP |
| 🔧 CLI & API | 命令行和编程方式 |
| 🧪 验证 | 内置 Skill 质量验证 |

## 安装

```bash
# 全局安装
npm install -g skillforge

# 或使用 npx
npx skillforge generate <输入文件>
```

## 快速开始

### 命令行使用

```bash
# 从 PRD 生成 Skill
skillforge generate examples/login-prd.md -o ./output

# 从 TRD 生成
skillforge generate examples/order-trd.md -o ./output

# 启用 AI 增强
skillforge generate input.md --ai --ai-key $OPENAI_API_KEY

# 仅验证
skillforge validate output/SKILL.md

# 创建示例 PRD
skillforge init my-project
```

### 编程使用

```typescript
import { parser, generator, formatter, validator } from 'skillforge';

const content = await fs.readFile('login-prd.md', 'utf-8');
const parsed = await parser.parse(content);
const skill = await generator.generate(parsed, { 
  includeExamples: true 
});
const skillMD = formatter.formatSkillMD(skill);
const validation = validator.validate(skill);

console.log(skillMD);
```

## CLI 命令

| 命令 | 说明 |
|------|------|
| `skillforge generate <file>` | 生成 Skill |
| `skillforge validate <file>` | 验证 Skill |
| `skillforge init <name>` | 创建示例 PRD |
| `skillforge serve` | 启动 Web UI |

### CLI 选项

| 选项 | 说明 | 示例 |
|------|------|------|
| `-o, --output` | 输出目录 | `-o ./output` |
| `-t, --type` | 输入类型 | `-t prd` |
| `-f, --format` | 输出格式 | `-f openclaw` |
| `--no-examples` | 排除示例 | |
| `--no-validation` | 跳过验证 | |
| `--ai` | 启用 AI | `--ai` |
| `--ai-provider` | AI 提供商 | `--ai-provider openai` |
| `--ai-model` | AI 模型 | `--ai-model gpt-4o-mini` |
| `--ai-key` | API Key | `--ai-key sk-xxx` |

## 输入类型

### PRD (产品需求文档)

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

### TRD (技术需求文档)

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

### 源代码

```typescript
// React 组件
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
      summary: 获取用户列表
      responses:
        '200':
          description: 成功
```

## 输出示例

生成的 `SKILL.md`:

```markdown
# 用户登录系统 助手

> 提供用户登录相关功能操作引导

## 触发词

- "登录"
- "账号登录"
- "短信登录"

## 步骤

### step_1: 用户进入登录页面

引导用户打开登录页面

**工具:** browser, message

### step_2: 选择登录方式

让用户选择登录方式

**工具:** prompt, message

## 示例

**用户:** 如何登录?
**助手:** 好的，让我帮你完成登录操作...
```

## 配置说明

创建 `skillforge.config.json`:

```json
{
  "format": "openclaw",
  "includeExamples": true,
  "ai": {
    "enabled": false,
    "provider": "openai",
    "model": "gpt-4o-mini"
  }
}
```

## AI 提供商配置

### OpenAI

```bash
skillforge generate input.md --ai --ai-provider openai --ai-key $OPENAI_API_KEY
```

### Anthropic Claude

```bash
skillforge generate input.md --ai --ai-provider anthropic --ai-key $ANTHROPIC_API_KEY
```

### Google Gemini

```bash
skillforge generate input.md --ai --ai-provider gemini --ai-key $GEMINI_API_KEY
```

## 输出格式

### OpenClaw 格式

```markdown
# SkillName

> 描述

## 触发词
- "关键词"

## 步骤
### step_1: 步骤标题
描述

**工具:** tool1, tool2
```

### Claude Code 格式

```bash
skillforge generate input.md -f claude-code -o ./output
```

## 项目结构

```
skillforge/
├── src/
│   ├── cli.ts              # CLI 入口
│   ├── parser.ts           # 解析器
│   ├── enhanced-parser.ts  # AI 增强解析器
│   ├── generator.ts        # 生成器
│   ├── formatter.ts        # 格式化器
│   ├── validator.ts        # 验证器
│   ├── llm.ts             # LLM 提供商
│   └── types.ts           # 类型定义
├── tests/                   # 测试用例
├── web-ui/                  # Web 界面
├── examples/                # 示例文件
└── package.json
```

## 使用教程

### 完整示例：从 PRD 生成 Skill

1. **安装**
   ```bash
   npm install -g skillforge
   ```

2. **创建 PRD**
   ```bash
   skillforge init my-project
   ```

3. **编辑 PRD**
   编辑生成的文件，添加你的功能需求和用户流程。

4. **生成 Skill**
   ```bash
   skillforge generate my-project.md -o ./output
   ```

5. **使用 Skill**
   将生成的 Skill 复制到你的 AI 助手的 skills 目录。

### 场景 1: 开发者分享新功能

```bash
# 1. 创建功能 PRD
cat > payment-prd.md << 'EOF'
# 支付系统

## 功能
- 微信支付
- 支付宝

## 流程
1. 选择支付方式
2. 输入支付信息
3. 确认支付
EOF

# 2. 生成 Skill
skillforge generate payment-prd.md -o ./skills/payment

# 3. 分享给用户
cp -r ./skills/payment /path/to/users/skills/
```

### 场景 2: API 文档转 Skill

```bash
# 从 API 文档生成
skillforge generate api-spec.json -o ./skills/api-helper
```

## 常见问题

### 1. 安装失败

**问题**: 提示权限错误

**解决**:
```bash
sudo npm install -g skillforge
```

### 2. 找不到命令

**解决**:
```bash
npm list -g skillforge
npx skillforge generate input.md
```

### 3. AI 生成失败

**问题**: AI 增强功能不工作

**解决**:
1. 确保已设置 API Key
2. 检查网络连接
3. 不使用 AI: `skillforge generate input.md` (不带 `--ai`)

### 4. 生成质量不好

**解决**:
1. 提供更详细的 PRD/TRD
2. 使用 AI 增强: `--ai --ai-key $KEY`
3. 手动调整生成的 SKILL.md

## 开发指南

```bash
# 克隆
git clone https://github.com/Yulingsong/skillforge.git
cd skillforge

# 安装
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm test
```

## 相关链接

- [GitHub](https://github.com/Yulingsong/skillforge)
- [问题反馈](https://github.com/Yulingsong/skillforge/issues)

---

## 更多文档

- [产品规范](./SPEC.md) - 产品需求和设计
- [API 参考](./docs/api.md) - 编程接口
- [配置详解](./docs/config.md) - 配置文件选项
- [常见问题](./docs/faq.md) - FAQ
- [使用教程](./docs/tutorial.md) - 详细教程
