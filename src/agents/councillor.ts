import { NO_SHELL_READONLY_FILE_OPERATIONS_RULES } from '../config';
import { type AgentDefinition, resolvePrompt } from './orchestrator';
import { createReadOnlyAgentPermission } from './permissions';

/**
 * Councillor agent - a read-only advisor in the multi-LLM council.
 *
 * Councillors are dispatched by the orchestrator via task() as agent sessions
 * (visible in tmux/UI). They have read-only access to the codebase via tools
 * but CANNOT modify files, run shell commands, or spawn subagents.
 *
 * Permission model mirrors OpenCode's built-in `explore` agent:
 * deny all, then selectively allow read-only tools.
 *
 * The per-councillor model is overridden at session creation time via the
 * `model` field in the prompt body - the agent factory's default model is
 * just a fallback.
 */
const COUNCILLOR_PROMPT = `You are a councillor in a multi-model council.

**Role**: 对给定的问题提供你最佳的独立分析和解决方案。

**Capabilities**: 你对代码库拥有只读访问权限。你可以：
- 读取文件（read）
- 按名称模式搜索（glob）
- 按内容搜索（grep）
- 搜索代码模式（ast_grep_search）
- 使用 OpenCode 内置的 \`lsp\` 工具（如果可用）
- 搜索外部文档（如果为此 agent 配置了 MCP）

你不能编辑文件、写入文件、运行 shell 命令或将任务委托给 \
其他 agent。你是顾问，不是实现者。

${NO_SHELL_READONLY_FILE_OPERATIONS_RULES}

**Behavior**:
- **在回答前检查代码库**——你的读取访问权限正是 council \
  的价值所在。不要猜测你能看到的代码。
- 彻底分析问题
- 提供完整、有理有据的回应
- 关注解决方案的质量和正确性
- 直接且简洁
- 不要受其他 councillor 观点的影响——你无法看到 \
  他们的回应

**Output**:
- 给出你的诚实评估
- 相关时引用具体文件和行号
- 包含相关推理
- 清晰陈述所有假设
- 标注任何不确定性`;

export function createCouncillorAgent(
  model: string,
  customPrompt?: string,
  customAppendPrompt?: string,
  variant?: string,
): AgentDefinition {
  const prompt = resolvePrompt(
    COUNCILLOR_PROMPT,
    customPrompt,
    customAppendPrompt,
  );

  return {
    name: 'councillor',
    description:
      '只读 council 顾问。检查代码库并提供独立分析。由 council 系统内部派发。',
    config: {
      model,
      variant,
      temperature: 0.2,
      prompt,
      // Strict read-only allowlist: deny all, then allow inspection tools only.
      permission: createReadOnlyAgentPermission(),
    },
  };
}
