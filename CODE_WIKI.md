# Oh My OpenCode Slim Code Wiki

## 目录
- [项目概述](#项目概述)
- [架构设计](#架构设计)
- [核心模块](#核心模块)
- [主要功能](#主要功能)
- [依赖关系](#依赖关系)
- [安装与配置](#安装与配置)
- [开发指南](#开发指南)

---

## 项目概述

### 简介
Oh My OpenCode Slim 是一个 OpenCode 插件，提供了一个多智能体（Multi-Agent）协作系统。它通过内置的专业智能体团队，实现智能体之间的任务委托与协作，平衡质量、速度和成本。

### 核心特性
- **多智能体协作系统**：内置 Orchestrator、Explorer、Oracle、Librarian、Designer、Fixer 等专业智能体
- **自动任务委托**：根据任务类型自动选择最合适的专业智能体
- **灵活配置**：支持自定义智能体配置、预设和权限
- **多供应商支持**：可混合使用多个 LLM 供应商的模型
- **丰富的工具集**：包括 webfetch、AST 搜索/替换、子任务等
- **会话管理**：支持子任务会话复用和管理
- **终端多路复用集成**：支持 Tmux 和 Zellij 实时可视化
- **多模型委员会**：Council 系统可并行调用多个模型并综合结果

### 项目结构
```
/workspace
├── src/                    # 源代码目录
│   ├── agents/            # 智能体定义和工厂
│   ├── cli/               # CLI 工具和安装程序
│   ├── config/            # 配置管理和模式
│   ├── council/           # Council 系统实现
│   ├── divoom/            # Divoom 显示集成
│   ├── hooks/             # 运行时钩子实现
│   ├── interview/         # 交互式访谈功能
│   ├── mcp/               # 模型上下文协议集成
│   ├── multiplexer/       # 终端多路复用器
│   ├── skills/            # 内置技能
│   ├── tools/             # 工具和命令
│   └── utils/             # 通用工具函数
├── docs/                  # 文档目录
└── scripts/               # 构建和发布脚本
```

---

## 架构设计

### 系统架构图
```
┌─────────────────────────────────────────────────────────┐
│                    OpenCode Host                        │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────┐ │
│  │            Oh My OpenCode Slim Plugin             │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  ┌──────────────┐     ┌───────────────────────┐ │ │
│  │  │  Orchestrator│────▶│  Specialized Agents   │ │ │
│  │  │   (Main)     │     ├───────────────────────┤ │ │
│  │  └──────────────┘     │ • Explorer            │ │ │
│  │         ▲             │ • Librarian           │ │ │
│  │         │             │ • Oracle              │ │ │
│  │         │             │ • Designer            │ │ │
│  │         │             │ • Fixer               │ │ │
│  │         │             │ • Council             │ │ │
│  │         │             └───────────────────────┘ │ │
│  │         │                      ▲                  │ │
│  │         │                      │                  │ │
│  │  ┌──────┴──────────────────────┴───────────────┐ │ │
│  │  │              Plugin Runtime               │ │ │
│  │  ├────────────────────────────────────────────┤ │ │
│  │  │ • Configuration Management               │ │ │
│  │  │ • Tool Registry                         │ │ │
│  │  │ • Hook System                          │ │ │
│  │  │ • Session Management                   │ │ │
│  │  │ • Multiplexer Integration              │ │ │
│  │  └────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 核心设计理念
1. **智能体分工**：不同任务分配给专门的智能体，发挥各自专长
2. **松耦合架构**：各模块通过明确接口交互，便于扩展和维护
3. **配置驱动**：通过配置文件而非代码修改实现灵活定制
4. **可扩展性**：支持自定义智能体、工具和技能
5. **容错设计**：包含自动重试、错误恢复和模型降级机制

---

## 核心模块

### 1. 入口模块 (`src/index.ts`)
**职责**：插件主入口，负责模块组装和注册

**主要功能**：
- 加载和合并配置
- 初始化所有智能体
- 注册工具、MCP 和钩子
- 管理运行时预设
- 协调多路复用器会话
- 处理生命周期事件

**关键导出**：
```typescript
export default OhMyOpenCodeLite;  // 插件主类
export type { AgentName, AgentOverrideConfig, PluginConfig, ... };
```

**文件位置**：[src/index.ts](file:///workspace/src/index.ts)

### 2. 智能体模块 (`src/agents/`)
**职责**：定义和管理所有内置智能体

**核心组件**：
- `index.ts`：智能体工厂和配置管理
- `orchestrator.ts`：主协调智能体
- `council.ts`：多模型委员会系统
- `councillor.ts`：委员会成员智能体
- `explorer.ts`：代码库探索智能体
- `librarian.ts`：知识检索智能体
- `oracle.ts`：战略顾问智能体
- `designer.ts`：UI/UX 设计智能体
- `fixer.ts`：快速实现智能体
- `observer.ts`：视觉分析智能体（可选）

**关键功能**：
```typescript
export function createAgents(config?: PluginConfig): AgentDefinition[];
export function getAgentConfigs(config?: PluginConfig): Record<string, SDKAgentConfig>;
export function getDisabledAgents(config?: PluginConfig): Set<string>;
```

**文件位置**：[src/agents/index.ts](file:///workspace/src/agents/index.ts)

### 3. 配置模块 (`src/config/`)
**职责**：配置加载、验证和管理

**核心组件**：
- `schema.ts`：配置模式定义（Zod）
- `constants.ts`：默认配置和常量
- `loader.ts`：配置文件加载器
- `runtime-preset.ts`：运行时预设管理
- `agent-mcps.ts`：智能体 MCP 权限
- `council-schema.ts`：Council 配置模式

**配置类型**：
```typescript
interface PluginConfig {
  preset?: string;
  presets?: Record<string, Preset>;
  agents?: Record<string, AgentOverrideConfig>;
  disabled_agents?: string[];
  disabled_mcps?: string[];
  multiplexer?: MultiplexerConfig;
  council?: CouncilConfig;
  fallback?: FailoverConfig;
  // ...更多配置
}
```

**文件位置**：[src/config/schema.ts](file:///workspace/src/config/schema.ts)

### 4. 工具模块 (`src/tools/`)
**职责**：提供各种工具和命令

**核心工具**：
- `ast-grep/`：AST 感知的搜索和替换
- `smartfetch/`：智能 Web 内容获取
- `subtask/`：子任务执行和管理
- `council.ts`：Council 系统工具
- `preset-manager.ts`：运行时预设切换

**主要导出**：
```typescript
export { ast_grep_search, ast_grep_replace } from './ast-grep';
export { createWebfetchTool } from './smartfetch';
export { createCouncilTool } from './council';
export { createSubtaskTool, createReadSessionTool } from './subtask';
export { createPresetManager } from './preset-manager';
```

**文件位置**：[src/tools/index.ts](file:///workspace/src/tools/index.ts)

### 5. 钩子模块 (`src/hooks/`)
**职责**：运行时钩子和行为增强

**核心钩子**：
- `apply-patch/`：补丁应用和错误恢复
- `auto-update-checker/`：自动更新检查
- `delegate-task-retry/`：任务委托重试指导
- `filter-available-skills/`：技能权限过滤
- `foreground-fallback/`：前台模型降级
- `json-error-recovery/`：JSON 错误恢复
- `phase-reminder/`：工作流阶段提醒
- `post-file-tool-nudge/`：文件工具后提示
- `task-session-manager/`：可复用任务会话
- `todo-continuation/`：待办自动继续

**工厂模式**：
```typescript
export function createApplyPatchHook(ctx: PluginContext);
export function createTodoContinuationHook(ctx: PluginContext, config: TodoContinuationConfig);
// ...更多钩子工厂
```

**文件位置**：[src/hooks/index.ts](file:///workspace/src/hooks/index.ts)

### 6. 多路复用器模块 (`src/multiplexer/`)
**职责**：终端多路复用器集成（Tmux/Zellij）

**核心组件**：
- `types.ts`：多路复用器抽象接口
- `factory.ts`：多路复用器工厂
- `session-manager.ts`：会话生命周期管理
- `tmux/`：Tmux 后端实现
- `zellij/`：Zellij 后端实现

**多路复用器类型**：
```typescript
type MultiplexerType = 'auto' | 'tmux' | 'zellij' | 'none';
type MultiplexerLayout = 'main-horizontal' | 'main-vertical' | 'tiled' | 'even-horizontal' | 'even-vertical';
```

**文件位置**：[src/multiplexer/index.ts](file:///workspace/src/multiplexer/index.ts)

### 7. Council 模块 (`src/council/`)
**职责**：多模型委员会系统实现

**核心组件**：
- `index.ts`：Council 管理器
- `council-manager.ts`：核心协调逻辑

**功能特性**：
- 并行调用多个模型
- 综合不同视角
- 可配置的委员会成员
- 超时和重试处理
- 结果提炼和总结

**文件位置**：[src/council/index.ts](file:///workspace/src/council/index.ts)

### 8. 实用工具模块 (`src/utils/`)
**职责**：跨模块共享的工具函数

**核心工具**：
- `agent-variant.ts`：智能体变体处理
- `logger.ts`：日志工具
- `session-manager.ts`：会话管理
- `subagent-depth.ts`：子代理深度跟踪
- `system-collapse.ts`：系统消息合并
- `task.ts`：任务解析

**文件位置**：[src/utils/index.ts](file:///workspace/src/utils/index.ts)

---

## 主要功能

### 1. 多智能体系统
#### Orchestrator（协调者）
- **角色**：主智能体，负责任务规划和委托
- **默认模型**：OpenAI GPT-5.5
- **职责**：
  - 分析用户请求
  - 决定是否需要委托
  - 协调多智能体工作流
  - 整合和总结结果

#### Explorer（探索者）
- **角色**：代码库侦察
- **默认模型**：OpenAI GPT-5.4-mini
- **职责**：
  - 浏览和理解代码库结构
  - 发现模式和架构
  - 快速定位相关文件

#### Librarian（图书管理员）
- **角色**：外部知识检索
- **默认模型**：OpenAI GPT-5.4-mini
- **职责**：
  - 网络搜索和文档查找
  - 整合信息
  - 提供上下文理解

#### Oracle（先知）
- **角色**：战略顾问，最后手段调试器
- **默认模型**：OpenAI GPT-5.5 (high)
- **职责**：
  - 架构决策建议
  - 复杂问题分析
  - 代码审查

#### Designer（设计师）
- **角色**：UI/UX 实现和视觉优化
- **默认模型**：OpenAI GPT-5.4-mini
- **职责**：
  - 前端实现
  - UI 设计
  - 视觉打磨

#### Fixer（修复者）
- **角色**：快速实现专家
- **默认模型**：OpenAI GPT-5.4-mini
- **职责**：
  - 执行具体实现任务
  - 处理常规编码工作
  - 测试编写和更新

#### Council（委员会）
- **角色**：多 LLM 共识和综合
- **职责**：
  - 并行调用多个模型
  - 收集不同观点
  - 综合最佳答案

#### Observer（观察者）
- **角色**：视觉分析（可选）
- **默认状态**：禁用
- **职责**：
  - 图像和截图理解
  - PDF 分析
  - 图表解读

### 2. 配置系统
#### 配置文件
位置：`~/.config/opencode/oh-my-opencode-slim.json`

示例配置：
```json
{
  "$schema": "https://unpkg.com/oh-my-opencode-slim@latest/oh-my-opencode-slim.schema.json",
  "preset": "openai",
  "presets": {
    "openai": {
      "orchestrator": { "model": "openai/gpt-5.5", "skills": ["*"], "mcps": ["*", "!context7"] },
      "oracle": { "model": "openai/gpt-5.5", "variant": "high", "skills": ["simplify"], "mcps": [] },
      "librarian": { "model": "openai/gpt-5.4-mini", "variant": "low", "skills": [], "mcps": ["websearch", "context7", "grep_app"] },
      "explorer": { "model": "openai/gpt-5.4-mini", "variant": "low", "skills": [], "mcps": [] },
      "designer": { "model": "openai/gpt-5.4-mini", "variant": "medium", "skills": [], "mcps": [] },
      "fixer": { "model": "openai/gpt-5.4-mini", "variant": "low", "skills": [], "mcps": [] }
    }
  }
}
```

#### 预设管理
- 支持多个预设
- 运行时切换：`/preset <preset-name>`
- 查看预设：`/preset`

### 3. 内置工具
#### webfetch
获取和处理 Web 内容。

**功能**：
- 智能缓存
- 自动摘要（可选）
- 二进制文件处理
- llms.txt 支持

#### ast-grep
AST 感知的代码搜索和替换。

**功能**：
- `ast_grep_search`：搜索代码模式
- `ast_grep_replace`：替换代码模式
- 支持多种语言

#### council_session
并行调用多个模型并综合结果。

**用法**：
```
@council 分析这个架构的优缺点
```

#### subtask
创建和管理子任务会话。

**功能**：
- 隔离的工作环境
- 自动清理
- 会话复用

### 4. 命令系统
#### `/preset`
切换或查看智能体配置预设。

```
/preset                    # 列出所有预设
/preset <preset-name>      # 切换到指定预设
```

#### `/auto-continue`
启用/禁用自动继续功能。

```
/auto-continue
```

#### `/subtask`
创建子任务。

```
/subtask <task-description>
```

#### `/goal`
设置会话目标。

```
/goal <goal-description>
```

#### `/interview`
启动交互式访谈以收集需求。

```
/interview
```

### 5. 多路复用器集成
支持 Tmux 和 Zellij 实时可视化子代理活动。

**配置**：
```json
{
  "multiplexer": {
    "type": "tmux",  // 或 "zellij", "auto", "none"
    "layout": "main-vertical",
    "main_pane_size": 60
  }
}
```

### 6. 自动重试和降级
- 模型可用性检测
- 自动切换到备用模型
- 速率限制处理
- 超时重试

---

## 依赖关系

### 核心依赖
```json
{
  "@opencode-ai/plugin": "^1.3.17",    // OpenCode 插件 SDK
  "@opencode-ai/sdk": "^1.3.17",       // OpenCode 核心 SDK
  "@modelcontextprotocol/sdk": "^1.29.0",  // MCP 协议
  "@ast-grep/cli": "^0.42.1",          // AST 搜索工具
  "@mozilla/readability": "^0.6.0",    // 网页内容提取
  "jsdom": "^26.1.0",                  // DOM 解析
  "turndown": "^7.2.4",                // HTML → Markdown
  "lru-cache": "^11.3.3"               // 缓存
}
```

### 开发依赖
```json
{
  "@biomejs/biome": "2.4.11",          // 代码格式化和 lint
  "typescript": "^5.9.3",              // TypeScript
  "zod": "^4.3.6",                     // 模式验证
  "bun-types": "1.3.12"                // Bun 类型
}
```

### 可选依赖
```json
{
  "@opentui/solid": "^0.1.97"          // TUI 组件库
}
```

### 模块依赖图
```
src/index.ts
├── src/agents/
│   ├── src/config/
│   └── src/utils/
├── src/config/
│   └── src/utils/
├── src/tools/
│   ├── src/config/
│   ├── src/council/
│   └── src/utils/
├── src/hooks/
│   ├── src/config/
│   └── src/utils/
├── src/multiplexer/
│   └── src/config/
├── src/council/
│   ├── src/config/
│   └── src/utils/
└── src/utils/
```

---

## 安装与配置

### 快速安装
```bash
# 使用 npm
npx oh-my-opencode-slim@latest install

# 使用 bun
bunx oh-my-opencode-slim@latest install

# 指定预设
bunx oh-my-opencode-slim@latest install --preset=opencode-go
```

### 手动安装
1. 安装包：
```bash
npm install -g oh-my-opencode-slim
```

2. 创建配置文件：
```bash
mkdir -p ~/.config/opencode
# 编辑 ~/.config/opencode/oh-my-opencode-slim.json
```

3. 认证 OpenCode：
```bash
opencode auth login
```

4. 刷新模型列表：
```bash
opencode models --refresh
```

### 验证安装
启动 OpenCode 并运行：
```
ping all agents
```

### 开发设置
```bash
# 克隆仓库
git clone https://github.com/alvinunreal/oh-my-opencode-slim.git
cd oh-my-opencode-slim

# 安装依赖
bun install

# 构建
bun run build

# 测试
bun test

# lint 和格式化
bun run lint
bun run format
```

---

## 开发指南

### 代码结构约定
- **TypeScript 严格模式**：所有代码使用 `strict: true`
- **模块化设计**：每个功能模块有自己的目录和 `index.ts`
- **工厂模式**：智能体、钩子和工具使用工厂函数创建
- **测试优先**：核心功能有对应的 `.test.ts` 文件

### 添加新智能体
1. 在 `src/agents/` 创建新文件
2. 实现工厂函数
3. 在 `src/agents/index.ts` 注册
4. 在 `src/config/constants.ts` 添加默认配置
5. 更新类型定义

### 添加新工具
1. 在 `src/tools/` 创建新目录或文件
2. 实现工具定义和执行逻辑
3. 在 `src/tools/index.ts` 导出
4. 在 `src/index.ts` 注册

### 添加新钩子
1. 在 `src/hooks/` 创建新目录
2. 实现钩子工厂和处理函数
3. 在 `src/hooks/index.ts` 导出
4. 在 `src/index.ts` 注册

### 测试
```bash
# 运行所有测试
bun test

# 运行特定测试
bun test src/agents/orchestrator.test.ts

# 类型检查
bun run typecheck
```

### 发布流程
```bash
# 版本更新
npm version patch  # 或 minor/major

# 发布
npm publish
```

---

## 常见问题

### Q: 如何添加自定义智能体？
A: 在配置文件的 `agents` 字段添加：
```json
{
  "agents": {
    "my-agent": {
      "model": "provider/model",
      "prompt": "你是一个自定义智能体...",
      "orchestratorPrompt": "当需要 X 时，委托给 @my-agent"
    }
  }
}
```

### Q: 如何禁用某个智能体？
A: 在配置中添加：
```json
{
  "disabled_agents": ["observer", "council"]
}
```

### Q: Council 系统如何工作？
A: Council 系统并行调用多个配置的模型，然后由主 Council 智能体综合所有响应，提供更全面的答案。

### Q: 如何贡献代码？
A: 
1. Fork 仓库
2. 创建功能分支
3. 提交更改
4. 确保通过测试和 lint
5. 创建 Pull Request

---

## 参考资源

- [项目 README](file:///workspace/README.md)
- [配置文档](file:///workspace/docs/configuration.md)
- [安装指南](file:///workspace/docs/installation.md)
- [GitHub 仓库](https://github.com/alvinunreal/oh-my-opencode-slim)

---

*本文档最后更新：2025年*
