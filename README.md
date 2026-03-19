# SkillForge ⚡

<p align="center">
  <img src="./logo.svg" alt="SkillForge Logo" width="128" height="128">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/node/v/skillforge-orange" alt="Node">
  <img src="https://img.shields.io/github/stars/Yulingsong/skillforge" alt="Stars">
  <img src="https://img.shields.io/npm/dm/skillforge" alt="Downloads">
</p>

<p align="center">
  <strong>AI 驱动的自动化技能生成工具 | 一键生成 AI Skill</strong>
</p>

---

## ✨ 特性

| 特性 | 说明 |
|------|------|
| 📄 **多输入支持** | PRD、TRD、源代码、OpenAPI |
| 🤖 **AI 增强** | OpenAI、Claude、Gemini |
| ⚡ **快速生成** | 秒级生成 Skill |
| 📦 **多种格式** | OpenClaw、Claude Code、MCP |
| 🔧 **CLI & API** | 命令行和编程方式 |
| 🧪 **验证** | 内置 Skill 质量验证 |

---

## 🚀 快速开始

```bash
# 安装
npm install -g skillforge

# 从 PRD 生成 Skill
skillforge generate examples/login-prd.md -o ./output
```

---

## 📖 示例

### 输入：PRD 文档

```markdown
# 用户登录系统

## 功能需求
1. 账号密码登录
2. 短信验证码登录
3. 第三方登录

## 用户流程
1. 用户进入登录页面
2. 选择登录方式
3. 输入账号信息
4. 点击登录
5. 登录成功
```

### 输出：SKILL.md

```markdown
# 用户登录系统 助手

> 提供用户登录相关功能操作引导

## 触发词
- "登录"
- "账号密码登录"
- "短信登录"

## 步骤
### step_1: 用户进入登录页面
引导用户打开登录页面
**工具:** browser, message

### step_2: 选择登录方式
让用户选择登录方式
**工具:** prompt, message

### step_3: 输入账号信息
引导用户输入账号
**工具:** prompt

## 示例
**用户:** 如何登录?
**助手:** 好的，让我帮你完成登录操作...
```

---

## 📦 安装

```bash
# 全局安装
npm install -g skillforge

# 或使用 npx
npx skillforge generate <输入文件>
```

---

## ⚙️ 配置

创建 `skillforge.config.json`：

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

---

## 🤖 AI 提供商

```bash
# OpenAI
skillforge generate input.md --ai --ai-key $OPENAI_KEY

# Anthropic
skillforge generate input.md --ai --ai-provider anthropic --ai-key $ANTHROPIC_KEY

# Gemini
skillforge generate input.md --ai --ai-provider gemini --ai-key $GEMINI_KEY
```

---

## 📚 文档

- [产品规范](./SPEC.md) - 产品需求和设计
- [API 参考](./docs/api.zh-CN.md) - 编程接口
- [使用教程](./docs/tutorial.md) - 详细教程
- [常见问题](./docs/faq.md) - FAQ

---

## 🛠️ 开发

```bash
git clone https://github.com/Yulingsong/skillforge.git
cd skillforge
npm install
npm run dev
```

---

## ⭐ 贡献

欢迎 Star 和 PR！

---

## 📄 License

MIT License

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Yulingsong">@Yulingsong</a>
</p>
