# MCP Inspector 调试指南

## 快速启动

### 1. 设置环境变量

```bash
export GEMINI_API_KEY="your-api-key-here"
export GEMINI_BASE_URL="https://generativelanguage.googleapis.com/v1beta"
export GEMINI_MODEL="gemini-2.5-flash-image"
```

### 2. 启动 MCP Inspector

```bash
# 确保在 gemini-image-mcp 项目目录中
cd gemini-image-mcp

# 使用 npx 启动 Inspector（无需安装）
npx @modelcontextprotocol/inspector node dist/index.js
```

### 3. 在浏览器中测试

Inspector 会自动打开浏览器，显示交互界面。

## 测试步骤

### 步骤 1: 验证服务器连接

在 Inspector 界面中，你应该看到：
- ✅ 服务器状态：Connected
- ✅ 服务器信息：gemini-image-mcp v1.0.0

### 步骤 2: 查看可用工具

在左侧面板中，应该看到：
- 📦 Tools (1)
  - generate_image

点击 `generate_image` 查看工具详情：
- 名称: generate_image
- 描述: Generate an image using Gemini Banana API based on a text prompt
- 参数:
  - prompt (required): 文本提示词
  - aspectRatio (optional): 图片宽高比
  - negativePrompt (optional): 负面提示词

### 步骤 3: 测试图片生成

点击 `generate_image` 工具，填写参数：

**测试 1: 简单提示词**
```json
{
  "prompt": "A beautiful red apple on a wooden table"
}
```

点击 "Call Tool" 按钮。

预期结果：
- ✅ 返回成功消息
- ✅ 显示 base64 编码的图片数据
- ✅ 图片能正常预览

**测试 2: 带宽高比**
```json
{
  "prompt": "A panoramic mountain landscape at sunset",
  "aspectRatio": "16:9"
}
```

**测试 3: 带负面提示词**
```json
{
  "prompt": "A cute cat sitting on a sofa",
  "negativePrompt": "dogs, people, other animals"
}
```

### 步骤 4: 查看请求和响应

在 Inspector 界面的 "Logs" 或 "Network" 标签中，你可以看到：
- 📤 发送的请求（JSON-RPC 格式）
- 📥 服务器的响应
- ⏱️ 请求耗时
- ❌ 错误信息（如果有）

## 常见测试场景

### 场景 1: 测试错误处理

**无效的 API Key:**
1. 停止当前的 Inspector
2. 设置错误的 API key: `export GEMINI_API_KEY="invalid-key"`
3. 重新启动 Inspector
4. 尝试生成图片

预期：应该看到错误信息，说明 API key 无效

**网络超时:**
提示词可以设置得非常复杂，测试是否能在 60 秒内完成

### 场景 2: 测试不同的宽高比

依次测试：
```json
{"prompt": "A tree", "aspectRatio": "1:1"}
{"prompt": "A tree", "aspectRatio": "16:9"}
{"prompt": "A tree", "aspectRatio": "9:16"}
{"prompt": "A tree", "aspectRatio": "4:3"}
{"prompt": "A tree", "aspectRatio": "3:4"}
```

### 场景 3: 压力测试

快速连续发送多个请求，检查：
- 服务器是否保持稳定
- 是否正确处理并发请求
- 内存使用是否正常

## Inspector 界面说明

### 左侧面板
- **Resources**: 显示可用的资源（本工具未使用）
- **Tools**: 显示所有可用的工具
- **Prompts**: 显示预定义的提示词（本工具未使用）

### 中间面板
- **Tool Details**: 工具的详细信息和参数
- **Input Form**: 填写工具参数
- **Call Tool**: 执行工具调用

### 右侧面板
- **Response**: 工具调用的响应结果
- **Logs**: 服务器日志和调试信息
- **Network**: JSON-RPC 请求和响应详情

## 调试技巧

### 1. 查看服务器日志

Inspector 会显示服务器的 stderr 输出。你应该看到：
```
Gemini Image MCP Server running on stdio
Using base URL: https://generativelanguage.googleapis.com/v1beta
Using model: gemini-2.5-flash-image
```

### 2. 检查 JSON-RPC 消息

在 Network 标签中，查看原始的 JSON-RPC 消息：

**请求示例：**
```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "tools/call",
  "params": {
    "name": "generate_image",
    "arguments": {
      "prompt": "A red apple"
    }
  }
}
```

**响应示例：**
```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Image generated successfully for prompt: \"A red apple\""
      },
      {
        "type": "image",
        "data": "iVBORw0KGgoAAAANS...",
        "mimeType": "image/png"
      }
    ]
  }
}
```

### 3. 添加调试日志

如果需要更详细的调试信息，可以修改 `src/index.ts`：

```typescript
private async handleImageGeneration(params: ImageGenerationParams) {
  console.error('[DEBUG] Starting image generation');
  console.error('[DEBUG] Params:', JSON.stringify(params, null, 2));

  try {
    const { prompt, negativePrompt } = params;
    let fullPrompt = prompt;

    console.error('[DEBUG] Full prompt:', fullPrompt);

    // ... API 调用 ...

    console.error('[DEBUG] API call successful');

    return {
      content: [/* ... */]
    };
  } catch (error) {
    console.error('[ERROR] Generation failed:', error);
    throw error;
  }
}
```

重新编译：
```bash
npm run build
```

然后重新启动 Inspector，你会在 Logs 面板看到这些调试信息。

## 故障排查

### 问题：Inspector 无法连接到服务器

**检查：**
```bash
# 确认 dist/index.js 存在
ls -lh dist/index.js

# 手动测试服务器
node dist/index.js
```

**解决方案：**
- 确保已运行 `npm run build`
- 确保 `dist/index.js` 有执行权限
- 检查是否有语法错误

### 问题：API 调用失败

**检查环境变量：**
```bash
echo $GEMINI_API_KEY
echo $GEMINI_MODEL
```

**测试 API 直接调用：**
```bash
curl -X POST \
  "${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}],"generationConfig":{"responseMimeType":"image/png"}}'
```

### 问题：图片无法显示

**检查：**
1. 响应中是否包含 base64 数据
2. mimeType 是否正确（应该是 `image/png`）
3. base64 数据是否有效

**验证 base64：**
将响应中的 data 字段复制出来，保存到文件：
```bash
echo "iVBORw0KGgoAAAANS..." | base64 -d > test.png
open test.png
```

## 完整测试清单

使用 Inspector 完成以下测试：

- [ ] 服务器成功启动并连接
- [ ] 能看到 generate_image 工具
- [ ] 工具参数定义正确
- [ ] 简单提示词能生成图片
- [ ] 复杂提示词能生成图片
- [ ] 不同宽高比都能工作
- [ ] 负面提示词功能正常
- [ ] 无效 API key 返回错误
- [ ] 错误信息清晰明了
- [ ] 响应时间在合理范围内（< 60秒）
- [ ] 生成的图片能正常显示
- [ ] 连续多次调用都稳定

## 测试完成后

所有测试通过后，你可以：

1. **在 Claude Desktop 中测试**
   使用相同的配置在实际的 Claude Desktop 环境中测试

2. **准备发布**
   ```bash
   npm login
   npm publish --access public
   ```

3. **发布后测试**
   ```bash
   npx @agentrix/gemini-image-mcp
   ```

## 更多资源

- MCP Inspector GitHub: https://github.com/modelcontextprotocol/inspector
- MCP 文档: https://modelcontextprotocol.io
- Gemini API 文档: https://ai.google.dev/docs

祝测试顺利！🚀
