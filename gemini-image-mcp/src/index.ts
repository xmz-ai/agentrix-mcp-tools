#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosError } from "axios";

// Configuration from environment variables
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-image";

// Validate required configuration
if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is required");
  process.exit(1);
}

interface ImageGenerationParams {
  prompt: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  negativePrompt?: string;
  safetySettings?: {
    category: string;
    threshold: string;
  }[];
}

interface GeminiImageResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

class GeminiImageMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "gemini-image-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: "generate_image",
          description: "Generate an image using Gemini Banana API based on a text prompt. Returns base64 encoded image data.",
          inputSchema: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description: "The text prompt describing the image to generate",
              },
              aspectRatio: {
                type: "string",
                enum: ["1:1", "16:9", "9:16", "4:3", "3:4"],
                description: "The aspect ratio of the generated image (default: 1:1)",
                default: "1:1",
              },
              negativePrompt: {
                type: "string",
                description: "Optional negative prompt describing what to avoid in the image",
              },
            },
            required: ["prompt"],
          },
        },
      ];

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === "generate_image") {
        return await this.handleImageGeneration(request.params.arguments as unknown as ImageGenerationParams);
      }

      throw new Error(`Unknown tool: ${request.params.name}`);
    });
  }

  private async handleImageGeneration(params: ImageGenerationParams): Promise<{
    content: Array<{ type: string; text?: string; data?: string; mimeType?: string }>;
  }> {
    try {
      const { prompt, negativePrompt } = params;

      // Construct the full prompt with negative prompt
      let fullPrompt = prompt;

      if (negativePrompt) {
        fullPrompt += `\n\nAvoid: ${negativePrompt}`;
      }

      // Prepare the request payload for Gemini API
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 1.0,
          topP: 0.95,
          topK: 40,
          responseMimeType: "image/png",
        },
      };

      // Make API request
      const url = `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

      const response = await axios.post<GeminiImageResponse>(url, requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000, // 60 second timeout
      });

      // Check for API errors
      if (response.data.error) {
        throw new Error(`Gemini API error: ${response.data.error.message}`);
      }

      // Extract image data from response
      const imageData = response.data.candidates?.[0]?.content?.parts?.[0]?.inlineData;

      if (!imageData || !imageData.data) {
        throw new Error("No image data returned from Gemini API");
      }

      return {
        content: [
          {
            type: "text",
            text: `Image generated successfully for prompt: "${prompt}"`,
          },
          {
            type: "image",
            data: imageData.data,
            mimeType: imageData.mimeType || "image/png",
          },
        ],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response?.data
          ? JSON.stringify(axiosError.response.data)
          : axiosError.message;

        return {
          content: [
            {
              type: "text",
              text: `Error generating image: ${errorMessage}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Error generating image: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error("Gemini Image MCP Server running on stdio");
    console.error(`Using base URL: ${GEMINI_BASE_URL}`);
    console.error(`Using model: ${GEMINI_MODEL}`);
  }
}

// Start the server
const server = new GeminiImageMCPServer();
server.run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
