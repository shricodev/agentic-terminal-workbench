import { fetch as globalFetch } from "./fetch";
import { fetchSSE } from "./fetch-sse";
import * as types from "./types";
import { getModelTokenLimits } from "./utils";
import pTimeout from "p-timeout";
import QuickLRU from "quick-lru";
import { encoding_for_model, Tiktoken } from "tiktoken";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_MODEL = "gpt-4-turbo-preview";

const USER_LABEL_DEFAULT = "User";
const ASSISTANT_LABEL_DEFAULT = "Agent";

/**
 * Minimal ChatGPT-style client for OpenAI chat completions.
 */
export class ChatGPTAPI {
  protected _apiKey: string;
  protected _apiBaseUrl: string;
  protected _debug: boolean;
  protected _model: string;

  protected _systemMessage: string;
  protected _completionParams: Omit<
    types.openai.CreateChatCompletionRequest,
    "messages" | "n"
  >;
  protected _maxModelTokens: number;
  protected _maxResponseTokens: number;
  protected _fetch: types.FetchFn;
  protected _tokenizer: Tiktoken | null;

  protected _getMessageById: types.GetMessageByIdFunction;
  protected _upsertMessage: types.UpsertMessageFunction;

  public _messageStore: QuickLRU<string, types.ChatMessage>;

  constructor(opts: types.ChatGPTAPIOptions) {
    const {
      apiKey,
      apiBaseUrl = "https://api.openai.com",
      debug = false,
      model = DEFAULT_MODEL,
      messageStore,
      completionParams,
      systemMessage,
      maxModelTokens,
      maxResponseTokens,
      getMessageById,
      upsertMessage,
      fetch = globalFetch,
    } = opts;

    this._apiKey = apiKey;
    this._apiBaseUrl = apiBaseUrl;
    this._debug = !!debug;
    this._model = model;
    this._fetch = fetch;

    // Get token limits based on the model
    const tokenLimits = getModelTokenLimits(model);
    this._maxModelTokens = maxModelTokens ?? tokenLimits.max;
    this._maxResponseTokens = maxResponseTokens ?? tokenLimits.response;

    this._completionParams = {
      model: this._model,
      temperature: 0.8,
      top_p: 1.0,
      presence_penalty: 1.0,
      ...completionParams,
    };

    this._systemMessage = systemMessage as string;

    if (this._systemMessage === undefined) {
      const currentDate = new Date().toISOString().split("T")[0];
      this._systemMessage = `You are Composio Agent, a large language model trained by OpenAI. Answer as concisely as possible.\nKnowledge cutoff: 2023-04\nCurrent date: ${currentDate}`;
    }

    this._getMessageById = getMessageById ?? this._defaultGetMessageById;
    this._upsertMessage = upsertMessage ?? this._defaultUpsertMessage;

    this._messageStore = new QuickLRU<string, types.ChatMessage>({
      maxSize: 10000,
    });

    try {
      this._tokenizer = encoding_for_model(this._model as any);
    } catch (error) {
      // Fallback to cl100k_base encoding (used by gpt-4 and gpt-3.5-turbo)..
      // should work
      if (this._debug) {
        console.warn(
          `Could not load tokenizer for model ${this._model}, using fallback`
        );
      }
      this._tokenizer = null;
    }

    if (!this._apiKey) {
      throw new Error("OpenAI missing required apiKey");
    }

    if (!this._fetch) {
      throw new Error("Invalid environment; fetch is not defined");
    }

    if (typeof this._fetch !== "function") {
      throw new Error('Invalid "fetch" is not a function');
    }
  }

  /**
   * Sends a prompt and returns the assistant reply.
   * Supports optional streaming via `opts.onProgress`.
   */
  async sendMessage(
    text: string,
    opts: types.SendMessageOptions = {}
  ): Promise<types.ChatMessage> {
    const {
      parentMessageId,
      messageId = uuidv4(),
      timeoutMs,
      onProgress,
      stream = onProgress ? true : false,
    } = opts;

    let { abortSignal } = opts;

    let abortController: AbortController | null = null;
    if (timeoutMs && !abortSignal) {
      abortController = new AbortController();
      abortSignal = abortController.signal;
    }

    const message: types.ChatMessage = {
      role: "user",
      id: messageId,
      parentMessageId,
      text,
    };
    await this._upsertMessage(message);

    const { messages, maxTokens, numTokens } = await this._buildMessages(
      text,
      opts
    );

    const result: types.ChatMessage = {
      role: "assistant",
      id: uuidv4(),
      parentMessageId: messageId,
      text: "",
    };

    const responseP = new Promise<types.ChatMessage>(
      async (resolve, reject) => {
        const url = `${this._apiBaseUrl}/v1/chat/completions`;
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this._apiKey}`,
        };
        const body = {
          max_tokens: maxTokens,
          ...this._completionParams,
          messages,
          stream,
        };

        if (this._debug) {
          console.log(`sendMessage (${numTokens} tokens)`, body);
        }

        if (stream) {
          fetchSSE(
            url,
            {
              method: "POST",
              headers,
              body: JSON.stringify(body),
              signal: abortSignal,
              onMessage: (data: string) => {
                if (data === "[DONE]") {
                  result.text = result.text.trim();
                  return resolve(result);
                }

                try {
                  const response: types.openai.CreateChatCompletionDeltaResponse =
                    JSON.parse(data);

                  if (response.id) {
                    result.id = response.id;
                  }

                  if (response?.choices?.length) {
                    const delta = response.choices[0].delta;
                    result.delta = delta.content;
                    if (delta?.content) result.text += delta.content;
                    result.detail = response;

                    if (delta.role) {
                      result.role = delta.role;
                    }

                    onProgress?.(result);
                  }
                } catch (err) {
                  console.warn("OpenAI stream SSE event unexpected error", err);
                  return reject(err);
                }
              },
            },
            this._fetch
          ).catch(reject);
        } else {
          try {
            const res = await this._fetch(url, {
              method: "POST",
              headers,
              body: JSON.stringify(body),
              signal: abortSignal,
            });

            if (!res.ok) {
              const reason = await res.text();
              const msg = `OpenAI error ${
                res.status || res.statusText
              }: ${reason}`;
              const error = new types.ChatGPTError(msg, { cause: res });
              error.statusCode = res.status;
              error.statusText = res.statusText;
              return reject(error);
            }

            const response: types.openai.CreateChatCompletionResponse =
              await res.json();
            if (this._debug) {
              console.log(response);
            }

            if (response?.id) {
              result.id = response.id;
            }

            if (response?.choices?.length) {
              const message = response.choices[0].message;
              if (!message) {
                return reject(new Error("OpenAI error: no message"));
              }
              // Tool-call responses can omit content; normalize to empty string.
              result.text = message.content ?? "";
              if (message.role) {
                result.role = message.role;
              }
            } else {
              const res = response as any;
              return reject(
                new Error(
                  `OpenAI error: ${
                    res?.detail?.message || res?.detail || "unknown"
                  }`
                )
              );
            }

            result.detail = response;

            return resolve(result);
          } catch (err) {
            return reject(err);
          }
        }
      }
    ).then((message) => {
      return this._upsertMessage(message).then(() => message);
    });

    if (timeoutMs) {
      // This will be called when a timeout occurs in order for us to forcibly
      // ensure that the underlying HTTP request is aborted.
      (responseP as any).cancel = () => {
        if (abortController !== null) {
          abortController.abort();
        }
      };

      return pTimeout(responseP, {
        milliseconds: timeoutMs,
        message: "OpenAI timed out waiting for response",
      });
    } else {
      return responseP;
    }
  }

  get apiKey(): string {
    return this._apiKey;
  }

  set apiKey(apiKey: string) {
    this._apiKey = apiKey;
  }

  get model(): string {
    return this._model;
  }

  set model(model: string) {
    this._model = model;
    this._completionParams.model = model;

    // Update token limits when model changes. this is important.
    const tokenLimits = getModelTokenLimits(model);
    this._maxModelTokens = tokenLimits.max;
    this._maxResponseTokens = tokenLimits.response;

    // Reinitialize tokenizer for the new  model
    try {
      if (this._tokenizer) {
        this._tokenizer.free();
      }
      this._tokenizer = encoding_for_model(model as any);
    } catch (error) {
      if (this._debug) {
        console.warn(
          `Could not load tokenizer for model ${model}, using fallback`
        );
      }
      this._tokenizer = null;
    }
  }

  protected async _buildMessages(text: string, opts: types.SendMessageOptions) {
    const { systemMessage = this._systemMessage } = opts;
    let { parentMessageId } = opts;

    const userLabel = USER_LABEL_DEFAULT;
    const assistantLabel = ASSISTANT_LABEL_DEFAULT;

    const maxNumTokens = this._maxModelTokens - this._maxResponseTokens;
    let messages: types.openai.ChatCompletionRequestMessage[] = [];

    if (systemMessage) {
      messages.push({
        role: "system",
        content: systemMessage,
      });
    }

    const systemMessageOffset = messages.length;
    let nextMessages = text
      ? messages.concat([
          {
            role: "user",
            content: text,
            name: opts.name,
          },
        ])
      : messages;
    let numTokens = 0;

    do {
      const prompt = nextMessages
        .reduce((prompt, message) => {
          switch (message.role) {
            case "system":
              return prompt.concat([`Instructions:\n${message.content}`]);
            case "user":
              return prompt.concat([`${userLabel}:\n${message.content}`]);
            default:
              return prompt.concat([`${assistantLabel}:\n${message.content}`]);
          }
        }, [] as string[])
        .join("\n\n");

      const nextNumTokensEstimate = await this._getTokenCount(prompt);
      const isValidPrompt = nextNumTokensEstimate <= maxNumTokens;

      if (prompt && !isValidPrompt) {
        break;
      }

      messages = nextMessages;
      numTokens = nextNumTokensEstimate;

      if (!isValidPrompt) {
        break;
      }

      if (!parentMessageId) {
        break;
      }

      const parentMessage = await this._getMessageById(parentMessageId);

      if (!parentMessage) {
        break;
      }

      const parentMessageRole = parentMessage.role || "user";

      nextMessages = nextMessages.slice(0, systemMessageOffset).concat([
        {
          role: parentMessageRole,
          content: parentMessage.text,
          name: parentMessage.name,
        },
        ...nextMessages.slice(systemMessageOffset),
      ]);

      parentMessageId = parentMessage.parentMessageId;
    } while (true);

    // Use up to 4096 tokens (prompt + response), but try to leave 1000 tokens
    // for the response.
    const maxTokens = Math.max(
      1,
      Math.min(this._maxModelTokens - numTokens, this._maxResponseTokens)
    );

    return { messages, maxTokens, numTokens };
  }

  /**
   * Preloads conversation history into the message store.
   */
  async loadMessages(messageList: types.ChatMessage[]) {
    for (const message of messageList) {
      await this._upsertMessage(message);
    }
  }

  protected async _getTokenCount(text: string) {
    text = text.replace(/<\|endoftext\|>/g, "");

    if (this._tokenizer) {
      try {
        const tokens = this._tokenizer.encode(text);
        return tokens.length;
      } catch (error) {
        if (this._debug) {
          console.warn(
            "Error using tokenizer, falling back to estimate:",
            error
          );
        }
      }
    }

    // Fallback to rough estimate (4 chars is about.. 1 token)
    return Math.ceil(text.length / 4);
  }

  protected async _defaultGetMessageById(
    id: string
  ): Promise<types.ChatMessage> {
    const res = this._messageStore.get(id) as types.ChatMessage;
    return res;
  }

  protected async _defaultUpsertMessage(
    message: types.ChatMessage
  ): Promise<void> {
    this._messageStore.set(message.id, message);
  }
}
