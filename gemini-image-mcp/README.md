# Gemini Image MCP Server

A Model Context Protocol (MCP) server that provides image generation capabilities using Google's Gemini Banana API.

## Features

- Generate images from text prompts using Gemini API
- Support for different aspect ratios (1:1, 16:9, 9:16, 4:3, 3:4)
- Negative prompts to avoid unwanted elements
- Returns base64 encoded images compatible with MCP clients
- Configurable API endpoint, key, and model

## Installation

### From npm (when published)

```bash
npm install -g @agentrix/gemini-image-mcp
```

### From source

```bash
git clone <repository-url>
cd gemini-image-mcp
npm install
npm run build
```

## Configuration

The server requires environment variables for configuration:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Yes | - | Your Gemini API key |
| `GEMINI_BASE_URL` | No | `https://generativelanguage.googleapis.com/v1beta` | Gemini API base URL |
| `GEMINI_MODEL` | No | `gemini-2.0-flash-exp` | Model to use for image generation |

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "gemini-image": {
      "command": "npx",
      "args": ["-y", "@agentrix/gemini-image-mcp"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here",
        "GEMINI_BASE_URL": "https://generativelanguage.googleapis.com/v1beta",
        "GEMINI_MODEL": "gemini-2.0-flash-exp"
      }
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "gemini-image": {
      "command": "gemini-image-mcp",
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Standalone

```bash
export GEMINI_API_KEY="your-api-key-here"
export GEMINI_BASE_URL="https://generativelanguage.googleapis.com/v1beta"
export GEMINI_MODEL="gemini-2.0-flash-exp"

gemini-image-mcp
```

## Available Tools

### generate_image

Generate an image from a text prompt.

**Parameters:**

- `prompt` (string, required): The text description of the image to generate
- `aspectRatio` (string, optional): The aspect ratio of the image. Options: "1:1", "16:9", "9:16", "4:3", "3:4". Default: "1:1"
- `negativePrompt` (string, optional): Description of elements to avoid in the image

**Returns:**

- Text confirmation message
- Base64 encoded image data with MIME type

**Example:**

```javascript
{
  "name": "generate_image",
  "arguments": {
    "prompt": "A serene mountain landscape at sunset with a lake reflection",
    "aspectRatio": "16:9",
    "negativePrompt": "people, buildings, text"
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode for development
npm run dev

# Run locally
npm start
```

## Publishing

To publish to npm:

1. Update version in `package.json`
2. Build the project: `npm run build`
3. Login to npm: `npm login`
4. Publish: `npm publish --access public`

## Requirements

- Node.js >= 18.0.0
- Valid Gemini API key with image generation access

## Error Handling

The server provides detailed error messages for common issues:

- Missing API key
- API request failures
- Invalid responses
- Network timeouts (60 second timeout per request)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on the GitHub repository.
