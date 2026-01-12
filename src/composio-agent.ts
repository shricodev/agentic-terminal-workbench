import { Composio } from "@composio/core";
import { OpenAIAgentsProvider } from "@composio/openai-agents";
import { Agent, run, MemorySession } from "@openai/agents";

export interface ComposioAgentOptions {
  apiKey: string;
  composioApiKey: string;
  model?: string;
  debug?: boolean;
}

export interface SendMessageOptions {
  onProgress?: (text: string) => void;
  onToolCall?: (toolName: string, args: any) => void;
}

export interface ChatMessage {
  id: string;
  text: string;
  role: "user" | "assistant" | "system";
}

/**
 * Composio-backed agent wrapper for the OpenAI Agents SDK.
 */
export class ComposioAgent {
  private composio: Composio<OpenAIAgentsProvider>;
  private agent: Agent | null = null;
  private session: any;
  private memory: MemorySession;
  private model: string;
  private debug: boolean;
  private userId: string;

  constructor(options: ComposioAgentOptions) {
    this.composio = new Composio<OpenAIAgentsProvider>({
      apiKey: options.composioApiKey,
      provider: new OpenAIAgentsProvider(),
    });

    this.model = options.model || "gpt-4-turbo-preview";
    this.debug = options.debug || false;
    this.memory = new MemorySession();
    this.userId = "";

    process.env.OPENAI_API_KEY = options.apiKey;
  }

  /**
   * Initializes a Composio session and loads toolkits for the user.
   */
  async initialize(userId: string, toolkits?: string[]): Promise<void> {
    try {
      this.userId = userId;

      // Create session with or without toolkits
      if (toolkits && toolkits.length > 0) {
        this.session = await this.composio.create(userId, { toolkits });
        if (this.debug) {
          console.log(
            `[Composio] Session created with toolkits: ${toolkits.join(", ")}`,
          );
        }
      } else {
        this.session = await this.composio.create(userId);
        if (this.debug) {
          console.log(`[Composio] Session created for user: ${userId}`);
        }
      }

      // Get tools from the session
      const tools = await this.session.tools();

      if (this.debug) {
        console.log(`[Composio] Loaded ${tools.length} tools`);
      }

      // Create the agent with tools
      this.agent = new Agent({
        name: "Composio Agent",
        instructions:
          "You are a helpful AI assistant with access to external tools. Answer as concisely as possible. Use the available tools to complete user requests.",
        model: this.model,
        tools,
      });

      if (this.debug && tools.length > 0) {
        console.log(
          `[Composio] Available tools from ${
            toolkits?.join(", ") || "all"
          } toolkit(s):`,
        );
        tools.slice(0, 5).forEach((tool: any) => {
          console.log(
            `  - ${tool.function?.name || tool.name || "Unknown tool"}`,
          );
        });
        if (tools.length > 5) {
          console.log(`  ... and ${tools.length - 5} more`);
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to initialize Composio: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }

  /**
   * Sends a prompt to the agent and returns the final response.
   */
  async sendMessage(
    text: string,
    options: SendMessageOptions = {},
  ): Promise<ChatMessage> {
    if (!this.agent) {
      throw new Error("Agent not initialized. Call initialize() first.");
    }

    try {
      if (this.debug) {
        console.log(`[Composio] Processing message: ${text}`);
      }

      // Create a custom event handler to capture tool calls
      const originalTools = this.agent.tools;

      // Wrap tools to intercept calls (if we want to show them)
      if (options.onToolCall && originalTools) {
        // Note: This approach might not work with the native integration
        // The @openai/agents SDK handles tools internally :(((
      }

      // Run the agent with the input
      // The @openai/agents SDK doesn't expose streaming or tool call events directly
      // It handles everything internally and returns the final result
      const result = await run(this.agent, text, {
        session: this.memory,
      });

      // The finalOutput contains the complete response
      const responseText =
        result.finalOutput ||
        "I apologize, but I was unable to generate a response.";

      if (this.debug) {
        console.log(
          `[Composio] Response: ${responseText.substring(0, 200)}...`,
        );
      }

      // Call progress callback if provided (for compatibility with existing UI)
      // Note: @openai/agents doesn't support streaming, so we send the full response
      if (options.onProgress) {
        options.onProgress(responseText);
      }

      return {
        id: Date.now().toString(),
        text: responseText,
        role: "assistant",
      };
    } catch (error) {
      throw new Error(
        `Failed to send message: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }

  /**
   * Recreates the session with a new toolkit list.
   */
  async updateToolkits(toolkits: string[]): Promise<void> {
    // Reinitialize with new toolkits
    await this.initialize(this.userId, toolkits);
  }

  /**
   * Clears in-memory conversation history.
   */
  clearHistory(): void {
    // Create new memory session
    this.memory = new MemorySession();
  }

  get currentModel(): string {
    return this.model;
  }

  set currentModel(model: string) {
    this.model = model;
    // Update agent with new model
    if (this.agent) {
      this.agent = new Agent({
        name: this.agent.name,
        instructions: this.agent.instructions,
        model: model,
        tools: this.agent.tools,
      });
    }
  }
}
