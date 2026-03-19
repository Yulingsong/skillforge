# SkillForge 更新日志

## v1.0.0 (2024-xx-xx)

### 新增
- 初始版本发布
- PRD 解析支持
- TRD 解析支持
- 源代码解析
- OpenAPI 解析
- AI 增强功能
- 多 AI 提供商支持
- CLI 工具
- Web UI
- 验证功能

### 核心功能
- 📄 多输入支持
- 🤖 AI 增强
- ⚡ 快速生成
- 📦 多种格式
- 🔧 CLI & API
- 🧪 验证

### 输入类型
- PRD (产品需求文档)
- TRD (技术需求文档)
- 源代码 (TypeScript, React, Vue)
- OpenAPI/Swagger

### 输出格式
- OpenClaw
- Claude Code
- MCP

### AI 提供商
- OpenAI
- Anthropic Claude
- Google Gemini

## 已知问题

- 暂无

## 路线图

### 计划中
- [ ] 视频解析
- [ ] 截图解析
- [ ] 插件系统
- [ ] 团队协作

---

## 安装

```bash
npm install -g skillforge
```

## 快速开始

```bash
# 生成 Skill
skillforge generate examples/login-prd.md -o ./output

# AI 增强
skillforge generate input.md --ai --ai-key $KEY
```

## 许可证

MIT License
