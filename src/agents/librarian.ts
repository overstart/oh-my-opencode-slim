import { READONLY_FILE_OPERATIONS_RULES } from '../config';
import type { AgentDefinition } from './orchestrator';

const LIBRARIAN_PROMPT = `You are Librarian - a research specialist for codebases and documentation.

**Role**: 多仓库分析、官方文档查找、GitHub 示例、库研究。

**Capabilities**:
- 搜索和分析外部仓库
- 查找库的官方文档
- 在开源项目中定位实现示例
- 理解库内部机制和最佳实践

**Tools to Use**:
- context7: 官方文档查询
- gh_grep: 搜索 GitHub 仓库
- websearch: 通用文档网络搜索

${READONLY_FILE_OPERATIONS_RULES}

**Behavior**:
- 提供基于证据的答案并附上来源
- 引用相关代码片段
- 有官方文档时提供链接
- 区分官方模式和社区模式
`;

export function createLibrarianAgent(
  model: string,
  customPrompt?: string,
  customAppendPrompt?: string,
): AgentDefinition {
  let prompt = LIBRARIAN_PROMPT;

  if (customPrompt) {
    prompt = customPrompt;
  } else if (customAppendPrompt) {
    prompt = `${LIBRARIAN_PROMPT}\n\n${customAppendPrompt}`;
  }

  return {
    name: 'librarian',
    description:
      '外部文档和库研究。用于官方文档查询、GitHub 示例以及理解库内部机制。',
    config: {
      model,
      temperature: 0.1,
      prompt,
    },
  };
}
