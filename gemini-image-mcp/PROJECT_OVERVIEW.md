# Gemini Image MCP - Project Overview

## 项目结构

```
gemini-image-mcp/
├── src/
│   └── index.ts              # 主要服务器实现
├── dist/                     # 编译输出目录 (npm run build 后生成)
├── package.json              # 项目配置和依赖
├── tsconfig.json             # TypeScript 配置
├── .gitignore               # Git 忽略文件
├── .npmignore               # npm 发布忽略文件
├── .env.example             # 环境变量示例
├── LICENSE                  # MIT 许可证
├── README.md                # 完整文档
├── QUICKSTART.md            # 快速入门指南
└── PROJECT_OVERVIEW.md      # 本文件
```

## 核心功能

### MCP Server Implementation (src/index.ts:1-200)

这是一个完整的 MCP (Model Context Protocol) 服务器实现，提供以下功能：

1. **环境配置**
   - `GEMINI_API_KEY` (必需): Gemini API 密钥
   - `GEMINI_BASE_URL` (可选): API 基础 URL
   - `GEMINI_MODEL` (可选): 使用的模型名称

2. **generate_image 工具**
   - 接收文本提示词生成图片
   - 支持多种宽高比 (1:1, 16:9, 9:16, 4:3, 3:4)
   - 支持负面提示词 (描述要避免的元素)
   - 支持保存到本地磁盘 (`path` 参数)
   - 自动处理多张图片（API 可能返回多个候选图片）
   - 返回 base64 编码的图片数据或保存路径

3. **错误处理**
   - API 请求失败处理
   - 超时控制 (60秒)
   - 详细的错误信息返回

## 技术栈

- **Node.js** (>=18.0.0): 运行时环境
- **TypeScript**: 类型安全的开发
- **@modelcontextprotocol/sdk**: MCP 协议实现
- **axios**: HTTP 客户端，用于调用 Gemini API

## 开发流程

### 1. 安装依赖
```bash
npm install
```

### 2. 开发模式
```bash
npm run dev    # TypeScript watch 模式
```

### 3. 构建
```bash
npm run build  # 编译到 dist/
```

### 4. 运行
```bash
export GEMINI_API_KEY="your-key"
npm start
```

## 发布流程

### 准备发布

1. 确保所有测试通过
2. 更新 `package.json` 中的版本号
3. 运行 `npm run build` 生成最新的编译文件
4. 检查 `.npmignore` 确保只发布必要文件

### 发布到 npm

```bash
# 首次发布需要登录
npm login

# 发布包 (带 --access public 因为是 scoped package)
npm publish --access public
```

### 发布后的文件

npm 包会包含：
- `dist/` - 编译后的 JavaScript 文件
- `package.json` - 包配置
- `README.md` - 文档
- `LICENSE` - 许可证

不会包含（通过 .npmignore 排除）：
- `src/` - 源代码
- `tsconfig.json` - TypeScript 配置
- `.env` 文件
- 开发相关文件

## 使用方式

### 方式 1: 全局安装

```bash
npm install -g @agentrix/gemini-image-mcp
gemini-image-mcp
```

### 方式 2: npx (推荐)

无需安装，直接使用：

```json
{
  "mcpServers": {
    "gemini-image": {
      "command": "npx",
      "args": ["-y", "@agentrix/gemini-image-mcp"],
      "env": {
        "GEMINI_API_KEY": "your-key"
      }
    }
  }
}
```

### 方式 3: 本地开发

```json
{
  "mcpServers": {
    "gemini-image": {
      "command": "node",
      "args": ["/path/to/gemini-image-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "your-key"
      }
    }
  }
}
```

## API 交互流程

1. **启动**: MCP 服务器通过 stdio 与客户端通信
2. **工具列表**: 客户端请求可用工具 -> 返回 `generate_image`
3. **生成图片**:
   - 客户端调用 `generate_image` 工具
   - 服务器构建 Gemini API 请求
   - 发送到 Gemini API
   - 接收 base64 图片数据
   - 返回给客户端

## 调试技巧

### 查看日志

服务器会在 stderr 输出日志：
```bash
# 运行时可以看到
Gemini Image MCP Server running on stdio
Using base URL: https://...
Using model: gemini-2.5-flash-image
```

### 测试 API 连接

可以单独测试 Gemini API：

```bash
curl -X POST \
  "${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"A cat"}]}]}'
```

## 扩展建议

未来可以添加的功能：
1. 支持更多图片参数（尺寸、风格等）
2. 批量生成图片
3. 图片编辑功能
4. 缓存机制减少 API 调用
5. 进度反馈（对于长时间生成）

## 许可证

MIT License - 详见 LICENSE 文件
