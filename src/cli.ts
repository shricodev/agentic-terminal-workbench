import { ComposioAgent } from "./composio-agent";
import { ChatGPTAPI } from "./index";
import { VALID_OPENAI_MODELS, isValidOpenAIModel } from "./utils";
import { cac } from "cac";
import chalk from "chalk";
import dotenv from "dotenv";
import ora from "ora";
import { readPackageUp } from "read-pkg-up";
import * as readline from "readline";

interface ToolkitItem {
  slug: string;
  name: string;
  meta?: {
    description?: string;
  };
}

interface ToolkitsResponse {
  items: ToolkitItem[];
}

async function fetchAvailableToolkits(apiKey: string): Promise<string[]> {
  const url = "https://backend.composio.dev/api/v3/toolkits";
  const options = {
    method: "GET",
    headers: { "x-api-key": apiKey },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Failed to fetch toolkits: ${response.statusText}`);
    }
    const data: ToolkitsResponse = await response.json();
    return data.items.map((item) => item.slug);
  } catch (error) {
    throw new Error(
      `Error fetching toolkits: ${
        error instanceof Error ? error.message : error
      }`
    );
  }
}

async function validateToolkits(
  toolkits: string[],
  composioApiKey: string
): Promise<void> {
  const spinner = ora({
    text: "Validating toolkits...",
    discardStdin: false,
    stream: process.stderr,
  }).start();

  try {
    const availableToolkits = await fetchAvailableToolkits(composioApiKey);
    const invalidToolkits: string[] = [];

    for (const toolkit of toolkits) {
      if (!availableToolkits.includes(toolkit)) {
        invalidToolkits.push(toolkit);
      }
    }

    spinner.stop();

    if (invalidToolkits.length > 0) {
      console.error(
        `\nError: The following toolkit(s) do not exist: ${invalidToolkits.join(
          ", "
        )}`
      );
      console.error(`Available toolkits: ${availableToolkits.join(", ")}`);
      process.exit(1);
    }
  } catch (error) {
    spinner.stop();
    console.error(
      `\nError validating toolkits: ${
        error instanceof Error ? error.message : error
      }`
    );
    process.exit(1);
  }
}

async function sendMessage(
  api: ChatGPTAPI,
  prompt: string,
  options: {
    timeout?: string;
    stream?: boolean;
    parentMessageId?: string;
  }
): Promise<{ text: string; id: string }> {
  const spinner = ora({
    text: "Thinking...",
    discardStdin: false,
    stream: process.stderr,
  }).start();

  let lastLength = 0;
  let hasStartedStreaming = false;

  try {
    const res = await api.sendMessage(prompt, {
      timeoutMs: options.timeout ? parseInt(options.timeout, 10) : undefined,
      parentMessageId: options.parentMessageId,
      onProgress: options.stream
        ? (partialResponse) => {
            if (!hasStartedStreaming) {
              spinner.stop();
              console.log(chalk.bold.green("\nAssistant:\n"));
              hasStartedStreaming = true;
            }

            // Only write the new text that we haven't written yet...
            const newText = partialResponse.text.slice(lastLength);
            if (newText) {
              process.stdout.write(newText);
              lastLength = partialResponse.text.length;
            }
          }
        : undefined,
    });

    if (hasStartedStreaming) {
      // Just add a blank line.
      console.log();
    } else {
      spinner.stop();
    }

    return { text: res.text, id: res.id };
  } catch (err) {
    spinner.stop();
    throw err;
  }
}

async function sendMessageWithComposio(
  agent: ComposioAgent,
  prompt: string,
  options: {
    timeout?: string;
    stream?: boolean;
  }
): Promise<{ text: string; id: string }> {
  const spinner = ora({
    text: "Thinking...",
    discardStdin: false,
    stream: process.stderr,
  }).start();

  try {
    // Note: @openai/agents SDK doesn't support streaming (as far as I can
    // tell). Show a different message when tools might be used
    spinner.text = chalk.cyan(
      "🔧 Processing and using Composio tools if required..."
    );

    // The agent handles all tool execution internally via the run method
    const res = await agent.sendMessage(prompt);

    spinner.stop();

    // Print the response
    console.log(chalk.bold.green("\nAssistant:\n"));
    console.log(res.text);

    console.log();

    return { text: res.text, id: res.id };
  } catch (err) {
    spinner.stop();
    throw err;
  }
}

function printBanner(): void {
  console.clear();
  console.log(chalk.bold.cyan("CLI Agent with Remote Tool Support"));
  console.log(chalk.gray("Access Composio toolkits"));
  console.log(chalk.dim("author: @shricodev\n"));
}

// Good enough since our commands are ASCII.
function visibleWidth(s: string): number {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "").length;
}

function padRight(s: string, width: number): string {
  const pad = Math.max(0, width - visibleWidth(s));
  return s + " ".repeat(pad);
}

type HelpRow = {
  tree: string; // "├─" or "└─"
  left: string;
  right: string;
};

function printHelp(currentToolkits?: string, currentModel?: string): void {
  const rows: HelpRow[] = [
    { tree: "├─", left: "/help", right: "Show this help message" },
    { tree: "├─", left: "/quit or /exit", right: "Exit the interactive mode" },
    {
      tree: "├─",
      left: "/model <name>",
      right: "Change model (e.g., /model gpt-4o)",
    },
    { tree: "├─", left: "/model list", right: "Show current model" },
    {
      tree: "├─",
      left: "/toolkits <list>",
      right: "Change toolkits (e.g., /toolkits github,gmail)",
    },
    {
      tree: "├─",
      left: "/toolkits list",
      right: "Show currently active toolkits",
    },
    { tree: "└─", left: "/clear", right: "Clear the screen" },
  ];

  // Build the uncolored left column including tree prefix.
  const leftStrings = rows.map((r) => `  ${r.tree} ${r.left}`);
  const leftColWidth = Math.max(...leftStrings.map(visibleWidth));
  const gap = 2; // spaces between left and right columns

  console.log(chalk.bold.yellow("Available Commands:"));

  rows.forEach((r) => {
    const leftPlain = `  ${r.tree} ${r.left}`;
    const leftPadded = padRight(leftPlain, leftColWidth) + " ".repeat(gap);

    // Colorize after padding
    const treeColored = chalk.gray(`  ${r.tree} `);
    const cmdColored = chalk.green(r.left);

    // Reconstruct left side with colors but same spacing:
    // easiest is to color by parts and then add padding based on plain width.
    const leftColored =
      treeColored +
      cmdColored +
      " ".repeat(
        Math.max(
          0,
          visibleWidth(leftPadded) -
            visibleWidth(`  ${r.tree} `) -
            visibleWidth(r.left)
        )
      );

    console.log(leftColored + chalk.gray(r.right));
  });

  console.log();
  console.log(
    chalk.bold.blue("Current Model: ") +
      chalk.cyan(currentModel || "gpt-4-turbo-preview")
  );

  console.log(
    chalk.bold.blue("Active Toolkits: ") +
      (currentToolkits ? chalk.yellow(currentToolkits) : chalk.gray("none"))
  );

  console.log(
    chalk.gray("\nTip: Just type your message and press Enter to chat!\n")
  );
}

async function handleSlashCommand(
  command: string,
  currentToolkits: string | undefined,
  currentModel: string | undefined,
  composioApiKey: string | undefined,
  api: ChatGPTAPI | ComposioAgent
): Promise<{
  action: "continue" | "exit" | "clear";
  newToolkits?: string;
  newModel?: string;
}> {
  const parts = command.slice(1).trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1).join(" ");

  switch (cmd) {
    case "help":
      printHelp(currentToolkits, currentModel);
      return { action: "continue" };

    case "quit":
    case "exit":
      return { action: "exit" };

    case "clear":
      return { action: "clear" };

    case "model":
      if (!args || args === "list") {
        console.log(
          chalk.bold.blue("\nCurrent Model: ") + chalk.cyan(currentModel) + "\n"
        );
        return { action: "continue" };
      }

      const modelName = args.trim();

      // Validate model
      if (!isValidOpenAIModel(modelName)) {
        console.log(chalk.red(`\nError: Invalid model name "${modelName}"\n`));
        console.log(chalk.yellow("Valid OpenAI models:"));
        VALID_OPENAI_MODELS.forEach((model) => {
          console.log(chalk.gray(`  - ${model}`));
        });
        console.log();
        return { action: "continue" };
      }

      // Update the model in the API instance
      if (api instanceof ComposioAgent) {
        api.currentModel = modelName;
      } else {
        api.model = modelName;
      }
      console.log(chalk.green(`\nModel updated to: ${modelName}\n`));
      return { action: "continue", newModel: modelName };

    case "toolkits":
      if (!args || args === "list") {
        if (currentToolkits) {
          console.log(
            chalk.bold.blue("\nCurrent Toolkits: ") +
              chalk.yellow(currentToolkits) +
              "\n"
          );
        } else {
          console.log(chalk.gray("\nNo toolkits currently active.\n"));
        }
        return { action: "continue" };
      }

      if (!composioApiKey) {
        console.log(
          chalk.red(
            "\nError: COMPOSIO_API_KEY not set. Cannot validate toolkits.\n"
          )
        );
        return { action: "continue" };
      }

      const toolkitsList = args.split(",").map((t) => t.trim());
      console.log(
        chalk.gray(`\nValidating toolkits: ${toolkitsList.join(", ")}...`)
      );

      try {
        await validateToolkits(toolkitsList, composioApiKey);

        // Update toolkits if using ComposioAgent
        if (api instanceof ComposioAgent) {
          console.log(chalk.gray("Updating Composio toolkits..."));
          const userId =
            process.env.COMPOSIO_USER_ID || "user_cli_" + Date.now();
          await api.initialize(userId, toolkitsList);
          console.log(
            chalk.green(`Toolkits updated: ${toolkitsList.join(", ")}\n`)
          );
        } else {
          console.log(
            chalk.yellow(
              `Note: Toolkits are only available when using Composio mode.\n`
            )
          );
        }

        return { action: "continue", newToolkits: args };
      } catch (error) {
        console.log(
          chalk.red(
            `Failed to update toolkits: ${
              error instanceof Error ? error.message : error
            }\n`
          )
        );
        return { action: "continue" };
      }

    default:
      console.log(chalk.red(`\nUnknown command: /${cmd}`));
      console.log(chalk.gray("Type /help to see available commands.\n"));
      return { action: "continue" };
  }
}

async function startInteractiveMode(
  api: ChatGPTAPI | ComposioAgent,
  options: {
    timeout?: string;
    stream?: boolean;
    toolkits?: string;
  },
  composioApiKey?: string
): Promise<void> {
  const isComposio = api instanceof ComposioAgent;
  const currentModelGetter = isComposio
    ? () => api.currentModel
    : () => api.model;

  printBanner();
  printHelp(options.toolkits, currentModelGetter());

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.bold.cyan("> "),
  });

  // Bun sometimes unrefs stdin so  keep it alive explicitly.
  if (process.stdin && typeof process.stdin.resume === "function") {
    process.stdin.resume();
  }

  // Keep a ref'd timer so the event loop doesn't drain
  const keepAlive = setInterval(() => {}, 1000);

  let parentMessageId: string | undefined;
  let currentToolkits = options.toolkits;
  let currentModel = currentModelGetter();
  let isProcessing = false;

  const lifecycleDebug = process.env.COMPOSIO_CLI_DEBUG === "1";
  const lifecycleLog = (...args: unknown[]) => {
    if (!lifecycleDebug) return;
    console.log(chalk.magenta("[interactive]"), ...args);
  };

  lifecycleLog(
    `stdin isTTY=${process.stdin.isTTY} stdout isTTY=${process.stdout.isTTY}`
  );

  process.on("SIGINT", () => {
    console.log(
      chalk.bold.cyan("\n\nThanks for using Composio Agent! Goodbye!\n")
    );
    clearInterval(keepAlive);
    rl.close();
    process.exit(0);
  });

  return new Promise((resolve) => {
    rl.on("close", () => {
      lifecycleLog("readline close");
      clearInterval(keepAlive);
      resolve();
    });

    process.stdin.on("end", () => lifecycleLog("stdin end"));
    process.stdin.on("data", (chunk) =>
      lifecycleLog("stdin data", JSON.stringify(chunk.toString()))
    );
    process.on("beforeExit", (code) => lifecycleLog(`beforeExit code=${code}`));
    process.on("exit", (code) => lifecycleLog(`exit code=${code}`));

    rl.on("line", (line: string) => {
      lifecycleLog("line event", JSON.stringify(line));
      const input = line.trim();

      if (!input) {
        rl.prompt();
        return;
      }

      if (isProcessing) {
        console.log(
          chalk.yellow("\nPlease wait for the current request to complete...\n")
        );
        rl.prompt();
        return;
      }

      if (input.startsWith("/")) {
        handleSlashCommand(
          input,
          currentToolkits,
          currentModel,
          composioApiKey,
          api
        ).then((result) => {
          if (result.action === "exit") {
            console.log(
              chalk.bold.cyan("\nThanks for using Composio Agent! Goodbye!\n")
            );
            clearInterval(keepAlive);
            rl.close();
            process.exit(0);
          } else if (result.action === "clear") {
            printBanner();
            printHelp(currentToolkits, currentModel);
          } else {
            if (result.newToolkits !== undefined) {
              currentToolkits = result.newToolkits;
            }
            if (result.newModel !== undefined) {
              currentModel = result.newModel;
            }
          }
          rl.prompt();
        });
        return;
      }

      isProcessing = true;
      rl.pause();
      lifecycleLog("sendMessage start", { stream: options.stream });

      const messagePromise = isComposio
        ? sendMessageWithComposio(api as ComposioAgent, input, {
            timeout: options.timeout,
            stream: options.stream,
          })
        : sendMessage(api as ChatGPTAPI, input, {
            timeout: options.timeout,
            stream: options.stream,
            parentMessageId,
          });

      messagePromise
        .then((res) => {
          lifecycleLog("sendMessage success");
          // Only print response if streaming is disabled and not using Composio
          // (streaming already printed it in sendMessage, Composio always prints)
          if (!options.stream && !isComposio) {
            console.log(chalk.bold.green("\nAssistant:\n"));
            console.log(res.text);
            console.log(); // Just add a blank line
          }
          parentMessageId = res.id;
          isProcessing = false;
          rl.resume();
          rl.prompt();
        })
        .catch((err) => {
          lifecycleLog("sendMessage error", err);
          console.log(chalk.red("\nError: ") + (err?.message || err) + "\n");
          isProcessing = false;
          rl.resume();
          rl.prompt();
        });
    });

    rl.prompt();
  });
}

async function main() {
  dotenv.config();

  const pkg = (await readPackageUp())?.packageJson;
  const cli = cac("composio-agent");

  cli
    .command(
      "[prompt]",
      "Ask Composio Agent a question (interactive mode if no prompt provided)"
    )
    .option("-c, --continue", "Continue last conversation", { default: false })
    .option("-d, --debug", "Enables debug logging", { default: false })
    .option("-s, --stream", "Streams the response", { default: true })
    .option("-t, --timeout <timeout>", "Timeout in milliseconds")
    .option("-k, --apiKey <apiKey>", "OpenAI API key")
    .option("-n, --conversationName <name>", "Unique name for the conversation")
    .option(
      "-m, --model <model>",
      "OpenAI model to use (e.g., gpt-4-turbo-preview, gpt-4o)"
    )
    .option(
      "--toolkits <toolkits>",
      "Comma-separated list of toolkits to use (e.g., github,gmail)"
    )
    .action(async (prompt, options) => {
      const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error(
          "Missing OpenAI API key. Use -k or set OPENAI_API_KEY in .env"
        );
        process.exit(1);
      }

      // Validate model if provided
      if (options.model && !isValidOpenAIModel(options.model)) {
        console.error(
          chalk.red(`\nError: Invalid model name "${options.model}"\n`)
        );
        console.error(chalk.yellow("Valid OpenAI models:"));
        VALID_OPENAI_MODELS.forEach((model) => {
          console.error(chalk.gray(`  - ${model}`));
        });
        process.exit(1);
      }

      // Check if toolkits are specified
      const usingComposio = !!options.toolkits;
      let api: ChatGPTAPI | ComposioAgent;

      if (usingComposio) {
        const composioApiKey = process.env.COMPOSIO_API_KEY;
        if (!composioApiKey) {
          console.error(
            "Missing Composio API key. Set COMPOSIO_API_KEY in .env"
          );
          process.exit(1);
        }

        const toolkitsList = options.toolkits
          .split(",")
          .map((t: string) => t.trim());
        await validateToolkits(toolkitsList, composioApiKey);

        // Get user ID from env or use default
        const userId = process.env.COMPOSIO_USER_ID || "user_cli_" + Date.now();

        // Create Composio agent
        console.log(chalk.gray("Initializing Composio with toolkits..."));
        const composioAgent = new ComposioAgent({
          apiKey,
          composioApiKey,
          model: options.model,
          debug: options.debug,
        });

        // Initialize with user ID and toolkits
        await composioAgent.initialize(userId, toolkitsList);
        console.log(chalk.green("✓ Composio initialized\n"));

        // Notify about streaming limitation
        if (options.stream) {
          console.log(
            chalk.yellow(
              "Note: Streaming is not supported with Composio toolkits.\n"
            )
          );
        }

        api = composioAgent;
      } else {
        // Use standard ChatGPT API
        api = new ChatGPTAPI({
          apiKey,
          debug: options.debug,
          model: options.model,
        });
      }

      if (!prompt) {
        await startInteractiveMode(
          api,
          {
            timeout: options.timeout,
            stream: options.stream,
            toolkits: options.toolkits,
          },
          process.env.COMPOSIO_API_KEY
        );
        return;
      }

      try {
        if (usingComposio) {
          // sendMessageWithComposio already prints the response
          await sendMessageWithComposio(api as ComposioAgent, prompt, {
            timeout: options.timeout,
            stream: options.stream,
          });
        } else {
          const res = await sendMessage(api as ChatGPTAPI, prompt, {
            timeout: options.timeout,
            stream: options.stream,
          });

          // Only print response if streaming is disabled
          // (streaming already printed it in sendMessage)
          if (!options.stream) {
            console.log(res.text);
          }
        }
      } catch (err: any) {
        console.error("Error:", err?.message || err);
        process.exit(1);
      }
    });

  cli.help();
  cli.version(pkg?.version || "0.0.0");
  cli.parse();
}

main().catch((err: any) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
