import { READONLY_FILE_OPERATIONS_RULES } from '../config';
import type { AgentDefinition } from './orchestrator';

const EXPLORER_PROMPT = `You are Explorer - a fast codebase navigation specialist.

**Role**: 代码库快速上下文搜索。回答"X 在哪里？"、"找到 Y"、"哪个文件有 Z"。

**When to use which tools**:
- **文本/正则模式**（字符串、注释、变量名）：grep
- **结构模式**（函数形状、类结构）：ast_grep_search
- **文件发现**（按名称/扩展名查找）：glob

${READONLY_FILE_OPERATIONS_RULES}

**Behavior**:
- 快速且全面
- 必要时并行发起多个搜索
- 返回文件路径及相关代码片段

**Output Format**:
<results>
<files>
- /path/to/file.ts:42 - 简要描述该位置的内容
</files>
<answer>
简洁回答所提问题
</answer>
</results>

**Constraints**:
- READ-ONLY: 搜索并报告，不要修改
- 详尽但简洁
- 相关时包含行号
`;

export function createExplorerAgent(
  model: string,
  customPrompt?: string,
  customAppendPrompt?: string,
): AgentDefinition {
  let prompt = EXPLORER_PROMPT;

  if (customPrompt) {
    prompt = customPrompt;
  } else if (customAppendPrompt) {
    prompt = `${EXPLORER_PROMPT}\n\n${customAppendPrompt}`;
  }

  return {
    name: 'explorer',
    description:
      "快速代码库搜索和模式匹配。用于查找文件、定位代码模式，以及回答'X 在哪里？'类问题。",
    config: {
      model,
      temperature: 0.1,
      prompt,
    },
  };
}
