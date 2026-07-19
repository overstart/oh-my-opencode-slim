import { describe, expect, test } from 'bun:test';
import { buildOrchestratorPrompt } from './orchestrator';

describe('orchestrator prompt', () => {
  test('requires the question tool for blocking user input', () => {
    const prompt = buildOrchestratorPrompt();

    expect(prompt).toContain('使用 `question` 工具');
    expect(prompt).toContain('启用自定义输入');
    expect(prompt).toContain('请求简洁的粘贴响应或命令输出');
    expect(prompt).toContain('一组有边界的小选项');
    expect(prompt).toContain('不阻塞工作的普通对话');
  });
});
