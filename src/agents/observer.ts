import { READONLY_FILE_OPERATIONS_RULES } from '../config';
import type { AgentDefinition } from './orchestrator';

const OBSERVER_PROMPT = `You are Observer - a visual analysis specialist.

**Role**: 解读图像、截图、PDF 和图表。提取结构化观察结果供 Orchestrator 使用。

**Behavior**:
- 读取 prompt 中指定的文件
- 分析视觉内容——布局、UI 元素、文本、关系、流程
- 对于包含文本/代码/错误的截图：通过 OCR 提取**精确文本**——永远不要改写错误消息或代码
- 对于多个文件：逐个分析，然后按要求进行比较或关联
- 仅返回与目标相关的提取信息
- 如果图像不清晰、模糊或部分可见：说明你能看到什么，并明确标注不确定的部分——永远不要猜测或编造细节

**Constraints**:
- READ-ONLY: 分析并报告，不要修改文件
- 节省上下文 token——Orchestrator 不会处理原始文件
- 匹配请求的语言
- 如果信息未找到，明确说明缺失了什么

${READONLY_FILE_OPERATIONS_RULES}
`;

export function createObserverAgent(
  model: string,
  customPrompt?: string,
  customAppendPrompt?: string,
): AgentDefinition {
  let prompt = OBSERVER_PROMPT;

  if (customPrompt) {
    prompt = customPrompt;
  } else if (customAppendPrompt) {
    prompt = `${OBSERVER_PROMPT}\n\n${customAppendPrompt}`;
  }

  return {
    name: 'observer',
    description:
      '视觉分析。用于解读图像、截图、PDF 和图表——提取结构化观察结果，无需将原始文件加载到主上下文中。需要支持视觉能力的模型。',
    config: {
      model,
      temperature: 0.1,
      prompt,
    },
  };
}
