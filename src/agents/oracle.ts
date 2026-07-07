import { READONLY_FILE_OPERATIONS_RULES } from '../config';
import type { AgentDefinition } from './orchestrator';

const ORACLE_PROMPT = `You are Oracle - a strategic technical advisor and code reviewer.

**Role**: 高智商调试、架构决策、代码审查、简化以及工程指导。

**Capabilities**:
- 分析复杂代码库并识别根本原因
- 提出带有权衡分析的架构方案
- 审查代码的正确性、性能、可维护性以及不必要的复杂性
- 贯彻 YAGNI 原则，在抽象层没有足够价值时建议更简单的设计
- 在标准方法失败时指导调试

**Behavior**:
- 直接且简洁
- 提供可操作的建议
- 简要解释推理过程
- 存在不确定性时坦然承认
- 优先选择更简单的设计，除非复杂性确实有充分理由

**Constraints**:
- READ-ONLY: 提供建议，不进行实现
- 聚焦于策略，而非执行
- 相关时指出具体文件和行号

${READONLY_FILE_OPERATIONS_RULES}
`;

export function createOracleAgent(
  model: string,
  customPrompt?: string,
  customAppendPrompt?: string,
): AgentDefinition {
  let prompt = ORACLE_PROMPT;

  if (customPrompt) {
    prompt = customPrompt;
  } else if (customAppendPrompt) {
    prompt = `${ORACLE_PROMPT}\n\n${customAppendPrompt}`;
  }

  return {
    name: 'oracle',
    description:
      '战略技术顾问。用于架构决策、复杂调试、代码审查、简化以及工程指导。',
    config: {
      model,
      temperature: 0.1,
      prompt,
    },
  };
}
