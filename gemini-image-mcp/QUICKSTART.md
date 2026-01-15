# Quick Start Guide

## Installation & Publishing

### 1. Install Dependencies

```bash
cd gemini-image-mcp
npm install
```

### 2. Build the Project

```bash
npm run build
```

This will compile TypeScript files to the `dist/` directory.

### 3. Test Locally

Before publishing, test the MCP server locally:

```bash
# Set environment variables
export GEMINI_API_KEY="your-api-key"
export GEMINI_BASE_URL="https://generativelanguage.googleapis.com/v1beta"
export GEMINI_MODEL="gemini-2.5-flash-image"

# Run the server
npm start
```

### 4. Test with Claude Desktop (Local)

Edit your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "gemini-image": {
      "command": "node",
      "args": ["/absolute/path/to/gemini-image-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Restart Claude Desktop and test the `generate_image` tool.

### 5. Publish to npm

When ready to publish:

```bash
# Login to npm (first time only)
npm login

# Publish the package
npm publish --access public
```

### 6. Use Published Package

After publishing, users can install with:

```bash
npm install -g @agentrix/gemini-image-mcp
```

And configure Claude Desktop:

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

Or use with npx (no installation needed):

```json
{
  "mcpServers": {
    "gemini-image": {
      "command": "npx",
      "args": ["-y", "@agentrix/gemini-image-mcp"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Example Usage

Once configured in Claude Desktop, you can ask Claude to generate images:

**Return base64 images:**
- "Generate an image of a sunset over mountains"
- "Create a 16:9 landscape image of a futuristic city"
- "Generate an image of a cat, but avoid any dogs or other animals"

The tool will return base64 encoded images that Claude can display.

**Save images to disk:**
- "Generate an image of a sunset and save it to /Users/myname/pictures"
- "Create an image of a cat and save it to ~/Downloads"

When saving to disk, the tool will:
- Create the directory if it doesn't exist
- Save all generated images with timestamped filenames (e.g., `image_1737023456789_1.png`)
- Return the full paths of saved files

## Troubleshooting

### Permission Issues During npm install

If you encounter EPERM errors, try:

```bash
# Use a different cache directory
npm install --cache /tmp/npm-cache-$USER

# Or clean npm cache
npm cache clean --force
npm install
```

### API Key Issues

Make sure your GEMINI_API_KEY is valid and has access to image generation features.

### Model Selection

Different Gemini models may have different capabilities. The default `gemini-2.5-flash-image` is optimized for image generation. Check Google's documentation for available models.

## Development

For development with auto-rebuild on changes:

```bash
npm run dev
```

This runs TypeScript in watch mode.
