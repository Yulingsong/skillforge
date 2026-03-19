# SkillForge 使用教程

## 完整示例：从 PRD 生成 Skill

### 步骤 1: 安装

```bash
npm install -g skillforge
```

### 步骤 2: 创建 PRD

创建 `login-prd.md`:

```markdown
# 用户登录系统

## 概述
提供安全、便捷的用户登录功能。

## 功能需求

### 1. 账号密码登录
- 支持手机号登录
- 支持邮箱登录
- 记住密码功能

### 2. 短信验证码登录
- 输入手机号
- 获取验证码
- 验证登录

### 3. 第三方登录
- 微信登录
- Google 登录

## 用户流程

### 登录流程
1. 用户进入登录页面
2. 选择登录方式（账号密码/短信验证码/第三方）
3. 根据选择输入相应信息
4. 点击登录按钮
5. 系统验证
6. 登录成功跳转首页，失败提示错误信息

### 注册流程
1. 用户进入注册页面
2. 选择注册方式
3. 填写基本信息
4. 获取并输入验证码
5. 设置密码
6. 完成注册，自动登录
```

### 步骤 3: 生成 Skill

```bash
skillforge generate login-prd.md -o ./output
```

### 步骤 4: 查看生成的 Skill

生成的 `output/SKILL.md`:

```markdown
# 用户登录系统 助手

> 提供安全、便捷的用户登录功能。

## 触发词

- "用户登录系统"
- "账号密码登录"
- "短信验证码登录"
- "第三方登录"
- "登录流程"

## 步骤

### step_1: 用户进入登录页面

用户进入登录页面

**工具:** http, prompt

### step_2: 选择登录方式（账号密码/短信验证码/第三方）

选择登录方式（账号密码/短信验证码/第三方）

**工具:** browser

### step_3: 根据选择输入相应信息

根据选择输入相应信息

**工具:** prompt

### step_4: 点击登录按钮

点击登录按钮

**工具:** browser

### step_5: 系统验证

系统验证

**工具:** message

### step_6: 登录成功跳转首页，失败提示错误信息

登录成功跳转首页，失败提示错误信息

**工具:** http, prompt

## 示例

**用户:** 如何登录?
**助手:** 好的，让我们开始用户进入登录页面。用户进入登录页面
```

## 实际使用场景

### 场景 1: 开发者分享新功能

开发者实现了一个新功能，需要生成 Skill 给用户使用：

```bash
# 1. 创建功能 PRD
cat > payment-prd.md << 'EOF'
# 支付系统

## 功能
- 微信支付
- 支付宝
- 银行卡支付

## 流程
1. 选择支付方式
2. 输入支付信息
3. 确认支付
4. 等待结果
EOF

# 2. 生成 Skill
skillforge generate payment-prd.md -o ./skills/payment

# 3. 分享给用户
cp -r ./skills/payment /path/to/users/skills/
```

### 场景 2: 产品文档转 Skill

将现有产品文档转换为可执行的 Skill：

```bash
# 从产品文档生成
skillforge generate product-manual.md -o ./skills/product-guide

# 添加自定义配置
cat >> ./skills/product-guide/skill.json << 'EOF'
{
  "name": "产品指南",
  "version": "1.0.0"
}
EOF
```

### 场景 3: API 文档转 Skill

从 OpenAPI 文档生成 API 调用助手：

```bash
# 从 API 文档生成
skillforge generate api-spec.json -o ./skills/api-helper

# 查看生成的内容
cat ./skills/api-helper/SKILL.md
```

## AI 增强功能

### 基础 AI 增强

```bash
skillforge generate input.md --ai --ai-key $OPENAI_API_KEY
```

AI 会：
- 补充更多用户流程
- 添加错误处理建议
- 优化步骤描述

### 选择 AI 提供商

```bash
# OpenAI
skillforge generate input.md --ai --ai-provider openai --ai-key $OPENAI_KEY

# Anthropic
skillforge generate input.md --ai --ai-provider anthropic --ai-key $ANTHROPIC_KEY

# Gemini
skillforge generate input.md --ai --ai-provider gemini --ai-key $GEMINI_KEY
```

### 选择模型

```bash
# 使用更好的模型
skillforge generate input.md --ai --ai-model gpt-4o

# 使用更快的模型
skillforge generate input.md --ai --ai-model gpt-4o-mini
```

## Skill 格式说明

### OpenClaw 格式

```markdown
# 技能名称

> 技能描述

## 触发词
- "关键词1"
- "关键词2"

## 步骤
### step_1: 步骤标题

步骤描述

**工具:** tool1, tool2
**验证:** 验证条件
**错误处理:** 错误处理方式

## 示例
**用户:** 示例问题
**助手:** 示例回答
```

### Claude Code 格式

```bash
skillforge generate input.md -f claude-code -o ./output
```

## 验证生成的 Skill

```bash
# 验证格式
skillforge validate output/SKILL.md

# 测试触发
skillforge validate output/SKILL.md --test "登录"
```

## 在 OpenClaw 中使用

### 1. 安装 Skill

将生成的 Skill 复制到 OpenClaw 的 skills 目录：

```bash
cp -r output/my-skill ~/.openclaw/skills/
```

### 2. 使用 Skill

在 OpenClaw 中直接调用：

```
用户: 帮我登录
助手: (自动使用 login-skill)
```

## 最佳实践

### 1. PRD 编写规范

- 明确功能列表
- 详细用户流程
- 清晰的数据模型

### 2. 生成的 Skill 审查

- 检查步骤完整性
- 验证触发词
- 补充特殊情况

### 3. 持续更新

- 功能更新后重新生成
- 收集用户反馈
- 优化生成质量
