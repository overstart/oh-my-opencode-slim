import { READONLY_FILE_OPERATIONS_RULES } from '../config';
import { shortModelLabel } from '../utils/session';
import { type AgentDefinition, resolvePrompt } from './orchestrator';
import { createReadOnlyAgentPermission } from './permissions';

// NOTE: Councillor system prompts live in the councillor agent factory.
// The format functions below only structure the USER message content - the
// agent factory provides the system prompt.

const COUNCIL_AGENT_PROMPT = `You are the Council agent - a multi-LLM \
orchestration system that runs consensus across multiple models.

**Tool**: 你可以使用 \`council_session\` 工具。你还拥有只读的代码库检查工具。你没有写入、编辑、shell 或子 agent 委托工具。

**When to use**:
- 当用户发出请求时被调用
- 当你希望对复杂问题获得多个专家意见时
- 当需要通过模型共识获得更高置信度时

**Usage**:
1. 使用用户的 prompt 调用 \`council_session\` 工具
2. 可选地指定 preset（省略则使用配置的默认 preset）
3. 接收 councillor 回应，格式化为综合输出
4. 遵循下方的综合流程
5. 将结果呈现给用户

**Synthesis Process**（必须——按顺序执行）：
1. 阅读原始用户 prompt
2. 逐一审查每个 councillor 的回应——按名称记录每个 councillor 的 \
关键见解和独特贡献
3. 识别 councillor 之间的一致和矛盾之处
4. 用明确的推理解决矛盾
5. 综合出最优的最终答案
6. 按照下方要求的输出格式进行格式化

**Behavior**:
- 将请求直接委托给 council_session
- 在调用 council_session 之前不要预先分析或过滤 prompt
- 使用 councillor 的名字标注来自特定 councillor 的见解
- 如果 councillor 之间存在分歧，解释你为什么选择一种方案而非另一种
- 不要在最终回应中省略每个 councillor 的详细信息
- 不要将输出压缩为仅一个最终摘要
- 当不同方案有各自合理的优缺点时，透明地展示权衡
- 不要只是简单平均各方回应——选择最佳方案并在此基础上改进

${READONLY_FILE_OPERATIONS_RULES}

**Required Output Format**:
在最终回应中始终包含以下部分：

## Council Response
提供最佳的综合答案。整合 councillor 的最强观点，解决分歧， \
给用户一个清晰的最终建议或答案。包含相关的代码示例和具体细节。

## Councillor Details
分别包含每个 councillor 的回应。

使用工具结果中提供的每个 councillor 的精确名称。

每个 councillor 格式如下：

### <councillor 名称>
<该 councillor 的回应>

如果某个 councillor 失败或超时，简要包含该状态。

## Council Summary
总结 councillor 在哪些方面一致，哪些方面存在分歧，为什么你选择了 \
最终答案，以及任何剩余的不确定性。包含共识置信度 \
评级：unanimous（一致）、majority（多数）或 split（分歧）。`;

export function createCouncilAgent(
  model: string,
  customPrompt?: string,
  customAppendPrompt?: string,
): AgentDefinition {
  const prompt = resolvePrompt(
    COUNCIL_AGENT_PROMPT,
    customPrompt,
    customAppendPrompt,
  );

  const definition: AgentDefinition = {
    name: 'council',
    description: '多 LLM council agent，综合多个模型的回应以生成更高质量的输出',
    config: {
      temperature: 0.1,
      prompt,
      permission: {
        ...createReadOnlyAgentPermission(),
        council_session: 'allow',
      },
    },
  };

  // Council's model comes from config override or is resolved at
  // runtime; only set if a non-empty string is provided.
  if (model) {
    definition.config.model = model;
  }

  return definition;
}

/**
 * Build the prompt for a specific councillor session.
 *
 * Returns the raw user prompt - the agent factory (councillor.ts) provides
 * the system prompt with tool-aware instructions. No duplication.
 *
 * If a per-councillor prompt override is provided, it is prepended as
 * role/guidance context before the user's question.
 */
export function formatCouncillorPrompt(
  userPrompt: string,
  councillorPrompt?: string,
): string {
  if (!councillorPrompt) return userPrompt;
  return `${councillorPrompt}\n\n---\n\n${userPrompt}`;
}

/**
 * Format councillor results for the council agent to synthesize.
 *
 * Formats councillor results as structured data that the council agent
 * (which called the tool) will receive as the tool response. The council
 * agent's system prompt contains synthesis instructions.
 * Returns a special message when all councillors failed to produce output.
 */
export function formatCouncillorResults(
  originalPrompt: string,
  councillorResults: Array<{
    name: string;
    model: string;
    status: string;
    result?: string;
    error?: string;
  }>,
): string {
  const completedWithResults = councillorResults.filter(
    (cr) => cr.status === 'completed' && cr.result,
  );

  const councillorSection = completedWithResults
    .map((cr) => {
      const shortModel = shortModelLabel(cr.model);
      return `**${cr.name}** (${shortModel}):\n${cr.result}`;
    })
    .join('\n\n');

  const failedSection = councillorResults
    .filter((cr) => cr.status !== 'completed')
    .map((cr) => `**${cr.name}**: ${cr.status} - ${cr.error ?? 'Unknown'}`)
    .join('\n');

  // Defensive guard: caller (runCouncil) short-circuits when all fail,
  // but this function may be reused in other contexts.
  if (completedWithResults.length === 0) {
    const errorDetails = councillorResults
      .map(
        (cr) =>
          `**${cr.name}** (${shortModelLabel(cr.model)}): ${cr.status} - ${
            cr.error ?? 'Unknown'
          }`,
      )
      .join('\n');

    return `---\n\n**Original Prompt**:\n${originalPrompt}\n\n---\n\n**Councillor Responses**:\nAll councillors failed to produce output:\n${errorDetails}\n\n请仅基于原始 prompt 生成回应。`;
  }

  let prompt = `---\n\n**Original Prompt**:\n${originalPrompt}\n\n---\n\n**Councillor Responses**:\n${councillorSection}`;

  if (failedSection) {
    prompt += `\n\n---\n\n**Failed/Timed-out Councillors**:\n${failedSection}`;
  }

  prompt +=
    '\n\n---\n\n你必须按照综合流程步骤生成输出：逐一审查每个 councillor 的回应，然后生成要求的输出，包含综合的 Council Response、使用精确名称的每个 councillor 详情，以及带有共识置信度评级（unanimous、majority 或 split）的 Council Summary。';

  return prompt;
}
