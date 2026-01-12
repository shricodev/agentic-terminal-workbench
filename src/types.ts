import Keyv from "keyv";

export type Role = "user" | "assistant" | "system";

export type FetchFn = typeof fetch;

export type ChatGPTAPIOptions = {
  apiKey: string;

  apiBaseUrl?: string;

  debug?: boolean;

  model?: string;

  completionParams?: Partial<
    Omit<openai.CreateChatCompletionRequest, "messages" | "n">
  >;

  systemMessage?: string;

  maxModelTokens?: number;

  maxResponseTokens?: number;

  messageStore?: Keyv;
  getMessageById?: GetMessageByIdFunction;
  upsertMessage?: UpsertMessageFunction;

  fetch?: FetchFn;
};

export type SendMessageOptions = {
  name?: string;
  parentMessageId?: string;
  messageId?: string;
  stream?: boolean;
  systemMessage?: string;
  timeoutMs?: number;
  onProgress?: (partialResponse: ChatMessage) => void;
  abortSignal?: AbortSignal;
};

export type MessageActionType = "next" | "variant";

export type SendMessageBrowserOptions = {
  conversationId?: string;
  parentMessageId?: string;
  messageId?: string;
  action?: MessageActionType;
  timeoutMs?: number;
  onProgress?: (partialResponse: ChatMessage) => void;
  abortSignal?: AbortSignal;
};

export interface ChatMessage {
  id: string;
  text: string;
  role: Role;
  name?: string;
  delta?: string;
  detail?: any;

  // relevant for both ChatGPTAPI and ChatGPTUnofficialProxyAPI
  parentMessageId?: string;
  // only relevant for ChatGPTUnofficialProxyAPI
  conversationId?: string;
}

export class ChatGPTError extends Error {
  statusCode?: number;
  statusText?: string;
  isFinal?: boolean;
  accountId?: string;
}

export type GetMessageByIdFunction = (id: string) => Promise<ChatMessage>;

export type UpsertMessageFunction = (message: ChatMessage) => Promise<void>;

export type ConversationJSONBody = {
  action: string;

  conversation_id?: string;

  messages: Prompt[];

  model: string;

  parent_message_id: string;
};

export type Prompt = {
  content: PromptContent;

  id: string;

  role: Role;
};

export type ContentType = "text";

export type PromptContent = {
  content_type: ContentType;

  parts: string[];
};

export type ConversationResponseEvent = {
  message?: Message;
  conversation_id?: string;
  error?: string | null;
};

export type Message = {
  id: string;
  content: MessageContent;
  role: Role;
  user: string | null;
  create_time: string | null;
  update_time: string | null;
  end_turn: null;
  weight: number;
  recipient: string;
  metadata: MessageMetadata;
};

export type MessageContent = {
  content_type: string;
  parts: string[];
};

export type MessageMetadata = any;

export namespace openai {
  export interface CreateChatCompletionDeltaResponse {
    id: string;
    object: "chat.completion.chunk";
    created: number;
    model: string;
    choices: [
      {
        delta: {
          role: Role;
          content?: string;
        };
        index: number;
        finish_reason: string | null;
      }
    ];
  }

  export interface ChatCompletionRequestMessage {
    role: ChatCompletionRequestMessageRoleEnum;

    content: string;

    name?: string;
  }
  export declare const ChatCompletionRequestMessageRoleEnum: {
    readonly System: "system";
    readonly User: "user";
    readonly Assistant: "assistant";
  };
  export declare type ChatCompletionRequestMessageRoleEnum =
    (typeof ChatCompletionRequestMessageRoleEnum)[keyof typeof ChatCompletionRequestMessageRoleEnum];

  export interface ChatCompletionResponseMessage {
    role: ChatCompletionResponseMessageRoleEnum;

    content: string;
  }
  export declare const ChatCompletionResponseMessageRoleEnum: {
    readonly System: "system";
    readonly User: "user";
    readonly Assistant: "assistant";
  };
  export declare type ChatCompletionResponseMessageRoleEnum =
    (typeof ChatCompletionResponseMessageRoleEnum)[keyof typeof ChatCompletionResponseMessageRoleEnum];

  export interface CreateChatCompletionRequest {
    model: string;

    messages: Array<ChatCompletionRequestMessage>;

    temperature?: number | null;

    top_p?: number | null;

    n?: number | null;

    stream?: boolean | null;

    stop?: CreateChatCompletionRequestStop;

    max_tokens?: number;

    presence_penalty?: number | null;

    frequency_penalty?: number | null;

    logit_bias?: object | null;

    user?: string;
  }

  export declare type CreateChatCompletionRequestStop = Array<string> | string;

  export interface CreateChatCompletionResponse {
    id: string;

    object: string;

    created: number;

    model: string;

    choices: Array<CreateChatCompletionResponseChoicesInner>;

    usage?: CreateCompletionResponseUsage;
  }

  export interface CreateChatCompletionResponseChoicesInner {
    index?: number;

    message?: ChatCompletionResponseMessage;

    finish_reason?: string;
  }

  export interface CreateCompletionResponseUsage {
    prompt_tokens: number;

    completion_tokens: number;

    total_tokens: number;
  }
}
