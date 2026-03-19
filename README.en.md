# SkillForge (English)

> AI-powered Skill generation from PRD, TRD, Source Code

[中文](./README.md) | English

## What is SkillForge?

SkillForge is a tool that automatically generates AI Skills from Product Requirements Documents (PRD), Technical Requirements Documents (TRD), source code, and more.

### Core Value

- **Developers**: One-click skill generation after feature development
- **Product Managers**: Quickly generate operation guides
- **End Users**: Complete professional operations through skill guidance

## Features

| Feature | Description |
|---------|-------------|
| 📄 Multi-Input | PRD, TRD, Source Code, OpenAPI |
| 🤖 AI-Enhanced | OpenAI, Anthropic Claude, Google Gemini |
| ⚡ Fast Generation | Generate skills in seconds |
| 📦 Multiple Formats | OpenClaw, Claude Code, MCP |
| 🔧 CLI & API | Command line and programmatic usage |
| 🧪 Validation | Built-in skill quality validation |

## Installation

```bash
# Global install
npm install -g skillforge

# Or use npx
npx skillforge generate <input-file>
```

## Quick Start

```bash
# Generate skill from PRD
skillforge generate examples/login-prd.md -o ./output

# Enable AI enhancement
skillforge generate input.md --ai --ai-key $OPENAI_API_KEY

# Validate skill
skillforge validate output/SKILL.md

# Create sample PRD
skillforge init my-project
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `skillforge generate <file>` | Generate Skill |
| `skillforge validate <file>` | Validate Skill |
| `skillforge init <name>` | Create sample PRD |
| `skillforge serve` | Start Web UI |

## Links

- [GitHub](https://github.com/Yulingsong/skillforge)
- [Documentation](./README.zh-CN.md)
