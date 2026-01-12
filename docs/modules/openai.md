[composio-agent](../readme.md) / [Exports](../modules.md) / openai

# Namespace: openai

## Table of contents

### Interfaces

- [ChatCompletionRequestMessage](../interfaces/openai.ChatCompletionRequestMessage.md)
- [ChatCompletionResponseMessage](../interfaces/openai.ChatCompletionResponseMessage.md)
- [CreateChatCompletionDeltaResponse](../interfaces/openai.CreateChatCompletionDeltaResponse.md)
- [CreateChatCompletionRequest](../interfaces/openai.CreateChatCompletionRequest.md)
- [CreateChatCompletionResponse](../interfaces/openai.CreateChatCompletionResponse.md)
- [CreateChatCompletionResponseChoicesInner](../interfaces/openai.CreateChatCompletionResponseChoicesInner.md)
- [CreateCompletionResponseUsage](../interfaces/openai.CreateCompletionResponseUsage.md)

### Type Aliases

- [ChatCompletionRequestMessageRoleEnum](openai.md#chatcompletionrequestmessageroleenum)
- [ChatCompletionResponseMessageRoleEnum](openai.md#chatcompletionresponsemessageroleenum)
- [CreateChatCompletionRequestStop](openai.md#createchatcompletionrequeststop)

### Variables

- [ChatCompletionRequestMessageRoleEnum](openai.md#chatcompletionrequestmessageroleenum-1)
- [ChatCompletionResponseMessageRoleEnum](openai.md#chatcompletionresponsemessageroleenum-1)

## Type Aliases

### ChatCompletionRequestMessageRoleEnum

Ƭ **ChatCompletionRequestMessageRoleEnum**: typeof [`ChatCompletionRequestMessageRoleEnum`](openai.md#chatcompletionrequestmessageroleenum-1)[keyof typeof [`ChatCompletionRequestMessageRoleEnum`](openai.md#chatcompletionrequestmessageroleenum-1)]

#### Defined in

[src/types.ts:181](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L181)

[src/types.ts:186](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L186)

---

### ChatCompletionResponseMessageRoleEnum

Ƭ **ChatCompletionResponseMessageRoleEnum**: typeof [`ChatCompletionResponseMessageRoleEnum`](openai.md#chatcompletionresponsemessageroleenum-1)[keyof typeof [`ChatCompletionResponseMessageRoleEnum`](openai.md#chatcompletionresponsemessageroleenum-1)]

#### Defined in

[src/types.ts:195](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L195)

[src/types.ts:200](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L200)

---

### CreateChatCompletionRequestStop

Ƭ **CreateChatCompletionRequestStop**: `string`[] \| `string`

#### Defined in

[src/types.ts:230](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L230)

## Variables

### ChatCompletionRequestMessageRoleEnum

• `Const` **ChatCompletionRequestMessageRoleEnum**: `Object`

#### Type declaration

| Name        | Type          |
| :---------- | :------------ |
| `Assistant` | `"assistant"` |
| `System`    | `"system"`    |
| `User`      | `"user"`      |

#### Defined in

[src/types.ts:181](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L181)

[src/types.ts:186](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L186)

---

### ChatCompletionResponseMessageRoleEnum

• `Const` **ChatCompletionResponseMessageRoleEnum**: `Object`

#### Type declaration

| Name        | Type          |
| :---------- | :------------ |
| `Assistant` | `"assistant"` |
| `System`    | `"system"`    |
| `User`      | `"user"`      |

#### Defined in

[src/types.ts:195](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L195)

[src/types.ts:200](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L200)
