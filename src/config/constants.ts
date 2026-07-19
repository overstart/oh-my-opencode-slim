// Agent names
export const AGENT_ALIASES: Record<string, string> = {
  explore: 'explorer',
  'frontend-ui-ux-engineer': 'designer',
};

export const SUBAGENT_NAMES = [
  'explorer',
  'librarian',
  'oracle',
  'designer',
  'fixer',
  'observer',
  'council',
  'councillor',
] as const;

export const ALL_AGENT_NAMES = ['orchestrator', ...SUBAGENT_NAMES] as const;

// Agent name type (for use in DEFAULT_MODELS)
export type AgentName = (typeof ALL_AGENT_NAMES)[number];

/** Agents that cannot be disabled even if listed in disabled_agents config. */
export const PROTECTED_AGENTS = new Set(['orchestrator', 'councillor']);

/**
 * Default models for each agent.
 * All set to undefined so agents follow the global/session model.
 * Users can override per-agent via oh-my-opencode-slim.json agents.<name>.model.
 */
export const DEFAULT_MODELS: Record<AgentName, string | undefined> = {
  orchestrator: undefined,
  oracle: undefined,
  librarian: undefined,
  explorer: undefined,
  designer: undefined,
  fixer: undefined,
  observer: undefined,
  council: undefined,
  councillor: undefined,
};

// Polling configuration
export const POLL_INTERVAL_MS = 500;
export const POLL_INTERVAL_BACKGROUND_MS = 2000;

// Timeouts
export const MAX_POLL_TIME_MS = 5 * 60 * 1000; // 5 minutes

// Workflow reminders
export const PHASE_REMINDER_TEXT = `!IMPORTANT! 调度器工作流：首先选择适合工作的最轻工作流。如果直接执行合理，完成它并按比例验证。否则：规划通道/依赖 -> 分发后台专家 -> 跟踪任务 ID -> 等待 hook 驱动的完成通知 -> 整合最终结果 -> 验证。不要轮询运行中的作业、消费运行中作业的输出或推进依赖工作。 !END!`;

export function formatSystemReminder(text: string): string {
  return `<system-reminder>\n${text}\n</system-reminder>`;
}

export const PHASE_REMINDER = formatSystemReminder(PHASE_REMINDER_TEXT);

export const WRITABLE_FILE_OPERATIONS_RULES = `**File Operations Rules**:
- 常规代码工作优先使用专用文件工具：glob/grep/ast_grep_search 用于发现，read 用于读取文件内容，edit/write/apply_patch 用于定向源码修改。
- 使用 bash 执行和自动化操作：git、包管理器、测试、构建、脚本、诊断以及 shell 原生的文件系统操作。
- 当批量或机械化的文件系统操作比大量单独编辑更清晰或更安全时（例如：截断生成的日志、删除构建产物、批量重命名/移动文件），可以使用 shell，尤其是用户明确要求该 shell 操作时。
- 在执行破坏性或大范围的 shell 操作之前，先验证目标集合并引用路径。实际操作前优先执行一次 dry-run/列出文件。
- 不要仅用 cat/head/tail/sed/awk 将代码读入上下文；应使用 read/grep，除非 shell 管道确实是更好的诊断手段。`;

export const READONLY_FILE_OPERATIONS_RULES = `**File Operations Rules**:
- READ-ONLY: 检查并报告；不要修改文件。
- 代码库检查优先使用专用文件工具：glob/grep/ast_grep_search 用于发现，read 用于读取文件内容。
- 允许使用 bash 进行非变更性诊断和 shell 原生检查（当它是最清晰工具时），但不能用于修改文件。
- 不要仅用 cat/head/tail/sed/awk 将代码读入上下文；应使用 read/grep，除非 shell 管道确实是更好的诊断手段。`;

export const NO_SHELL_READONLY_FILE_OPERATIONS_RULES = `**File Operations Rules**:
- READ-ONLY: 检查并报告；不要修改文件。
- 使用 glob/grep/ast_grep_search 进行发现，使用 read 读取文件内容。
- 不要使用 bash 或 shell 命令。`;

// Tmux pane spawn delay (ms) - gives TmuxSessionManager time to create pane
export const TMUX_SPAWN_DELAY_MS = 500;

// Stagger delay (ms) between parallel councillor launches to avoid tmux collisions
export const COUNCILLOR_STAGGER_MS = 250;

// Polling stability
export const STABLE_POLLS_THRESHOLD = 3;

/** Agents that are disabled by default. Users must explicitly enable them
 *  by removing from disabled_agents and configuring an appropriate model. */
export const DEFAULT_DISABLED_AGENTS: string[] = ['observer'];

// Background job defaults
export const DEFAULT_MAX_SESSIONS_PER_AGENT = 2;
export const DEFAULT_READ_CONTEXT_MIN_LINES = 10;
export const DEFAULT_READ_CONTEXT_MAX_FILES = 8;

export type ImageRouting = 'auto' | 'direct';

/**
 * Used when image_routing is omitted, preserving legacy conditional Observer
 * routing. Explicit "auto" is validated separately after config layers merge.
 */
export const DEFAULT_IMAGE_ROUTING: ImageRouting = 'auto';

export function resolveImageRouting(
  imageRouting: ImageRouting | undefined,
): ImageRouting {
  return imageRouting ?? DEFAULT_IMAGE_ROUTING;
}
