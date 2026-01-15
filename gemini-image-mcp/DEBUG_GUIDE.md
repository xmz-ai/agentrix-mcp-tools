# 调试指南 - 发布前测试

## 方法一：使用 MCP Inspector（推荐）

MCP Inspector 是官方提供的调试工具，可以可视化测试 MCP 服务器。

### 1. 安装 MCP Inspector

```bash
npm install -g @modelcontextprotocol/inspector
```

### 2. 启动 Inspector

```bash
# 在项目目录中
cd gemini-image-mcp

# 设置环境变量
export GEMINI_API_KEY="your-api-key-here"
export GEMINI_BASE_URL="https://generativelanguage.googleapis.com/v1beta"
export GEMINI_MODEL="gemini-2.5-flash-image"

# 启动 Inspector
mcp-inspector node dist/index.js
```

### 3. 在浏览器中测试

Inspector 会自动打开浏览器，你可以：
- 查看可用的工具列表
- 测试 `generate_image` 工具
- 查看请求和响应
- 检查错误信息

## 方法二：命令行直接测试

### 1. 测试服务器启动

```bash
export GEMINI_API_KEY="test-key"
npm start
```

如果缺少 API key，应该看到错误提示：
```
Error: GEMINI_API_KEY environment variable is required
```

### 2. 使用 stdio 协议测试

创建一个测试脚本 `test-mcp.js`：

```javascript
import { spawn } from 'child_process';

const server = spawn('node', ['dist/index.js'], {
  env: {
    ...process.env,
    GEMINI_API_KEY: 'your-api-key-here'
  }
});

// 监听服务器输出
server.stderr.on('data', (data) => {
  console.log('Server:', data.toString());
});

// 发送 MCP 初始化请求
const initRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "test-client",
      version: "1.0.0"
    }
  }
};

server.stdin.write(JSON.stringify(initRequest) + '\n');

// 列出工具
setTimeout(() => {
  const listToolsRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {}
  };
  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 1000);

// 监听响应
server.stdout.on('data', (data) => {
  console.log('Response:', data.toString());
});

// 5秒后退出
setTimeout(() => {
  server.kill();
  process.exit(0);
}, 5000);
```

运行测试：
```bash
node test-mcp.js
```

## 方法三：在 Claude Desktop 中本地测试

### 1. 配置 Claude Desktop

编辑配置文件：
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

添加配置：
```json
{
  "mcpServers": {
    "gemini-image-local": {
      "command": "node",
      "args": ["/绝对路径/gemini-image-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**重要**：必须使用绝对路径！

获取绝对路径：
```bash
cd gemini-image-mcp
pwd
# 输出类似：/Users/username/projects/gemini-image-mcp
```

### 2. 重启 Claude Desktop

完全退出并重新启动 Claude Desktop。

### 3. 测试功能

在 Claude Desktop 中询问：
- "你现在有什么工具可用？"（应该看到 generate_image）
- "帮我生成一张山景图片"

### 4. 查看日志

如果出现问题，查看 Claude Desktop 日志：

**macOS/Linux:**
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

**Windows:**
```powershell
Get-Content "$env:APPDATA\Claude\Logs\mcp-*.log" -Wait
```

## 方法四：单元测试（高级）

创建测试文件 `test/generate-image.test.js`：

```javascript
import { expect } from 'chai';
import { spawn } from 'child_process';

describe('Gemini Image MCP Server', () => {
  let server;

  beforeEach(() => {
    server = spawn('node', ['dist/index.js'], {
      env: {
        ...process.env,
        GEMINI_API_KEY: 'test-key'
      }
    });
  });

  afterEach(() => {
    server.kill();
  });

  it('should list available tools', (done) => {
    const request = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: {}
    };

    server.stdout.once('data', (data) => {
      const response = JSON.parse(data.toString());
      expect(response.result.tools).to.be.an('array');
      expect(response.result.tools[0].name).to.equal('generate_image');
      done();
    });

    server.stdin.write(JSON.stringify(request) + '\n');
  });
});
```

## 常见问题排查

### 问题 1: 服务器无法启动

**检查：**
```bash
# 验证编译是否成功
ls -lh dist/index.js

# 检查文件权限
chmod +x dist/index.js

# 直接运行查看错误
GEMINI_API_KEY=test node dist/index.js
```

### 问题 2: API 调用失败

**测试 API 连接：**
```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "A red apple"}]
    }],
    "generationConfig": {
      "responseMimeType": "image/png"
    }
  }'
```

如果返回错误，检查：
- API key 是否正确
- 是否有访问权限
- 模型名称是否正确
- 网络连接是否正常

### 问题 3: Claude Desktop 无法识别工具

**检查配置：**
```bash
# 验证 JSON 格式
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .

# 确认路径正确
node /你的绝对路径/dist/index.js
```

**常见错误：**
- 使用了相对路径（必须用绝对路径）
- JSON 格式错误（缺少逗号、引号等）
- 环境变量拼写错误
- 没有重启 Claude Desktop

### 问题 4: 图片生成失败

**启用详细日志：**

修改 `src/index.ts`，添加调试日志：

```typescript
private async handleImageGeneration(params: ImageGenerationParams) {
  try {
    console.error('[DEBUG] Generating image with params:', JSON.stringify(params));

    const { prompt, negativePrompt } = params;
    let fullPrompt = prompt;

    console.error('[DEBUG] Full prompt:', fullPrompt);

    const response = await axios.post(url, requestBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 60000,
    });

    console.error('[DEBUG] Response status:', response.status);
    console.error('[DEBUG] Response data:', JSON.stringify(response.data));

    // ... rest of the code
  } catch (error) {
    console.error('[ERROR] Image generation failed:', error);
    throw error;
  }
}
```

重新编译并测试：
```bash
npm run build
node dist/index.js
```

## 完整测试清单

发布前确保通过以下测试：

- [ ] 编译无错误无警告
- [ ] 服务器能正常启动
- [ ] 缺少 API key 时显示错误
- [ ] 能列出工具（tools/list）
- [ ] 能调用 generate_image 工具
- [ ] 能处理有效的图片生成请求
- [ ] 能正确处理错误（无效 API key、网络错误等）
- [ ] 在 Claude Desktop 中能正常工作
- [ ] 生成的图片能正常显示
- [ ] 负面提示词功能正常
- [ ] 超时处理正常（60秒）

## 性能测试

测试不同的提示词：

```bash
# 简单提示词
"A red apple"

# 复杂提示词
"A photorealistic landscape with mountains, a lake, and sunset, highly detailed, 8k resolution"

# 带负面提示词
prompt: "A cat sitting on a chair"
negativePrompt: "dogs, other animals, people"

# 不同宽高比
aspectRatio: "16:9"
aspectRatio: "9:16"
aspectRatio: "1:1"
```

## 准备发布

所有测试通过后：

```bash
# 1. 清理构建
rm -rf dist/
npm run build

# 2. 测试安装
npm pack
npm install -g agentrix-gemini-image-mcp-1.0.0.tgz

# 3. 测试全局命令
gemini-image-mcp

# 4. 清理测试安装
npm uninstall -g @agentrix/gemini-image-mcp

# 5. 发布
npm login
npm publish --access public
```

发布成功后，等待几分钟，然后测试：
```bash
npx @agentrix/gemini-image-mcp
```

祝调试顺利！🎉
