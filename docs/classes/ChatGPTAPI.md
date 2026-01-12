[composio-agent](../readme.md) / [Exports](../modules.md) / ChatGPTAPI

# Class: ChatGPTAPI

Minimal ChatGPT-style client for OpenAI chat completions.

## Table of contents

### Constructors

- [constructor](ChatGPTAPI.md#constructor)

### Properties

- [\_messageStore](ChatGPTAPI.md#_messagestore)

### Accessors

- [apiKey](ChatGPTAPI.md#apikey)
- [model](ChatGPTAPI.md#model)

### Methods

- [loadMessages](ChatGPTAPI.md#loadmessages)
- [sendMessage](ChatGPTAPI.md#sendmessage)

## Constructors

### constructor

• **new ChatGPTAPI**(`opts`): [`ChatGPTAPI`](ChatGPTAPI.md)

#### Parameters

| Name   | Type                                                   |
| :----- | :----------------------------------------------------- |
| `opts` | [`ChatGPTAPIOptions`](../modules.md#chatgptapioptions) |

#### Returns

[`ChatGPTAPI`](ChatGPTAPI.md)

#### Defined in

[src/gpt-api.ts:40](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/gpt-api.ts#L40)

## Properties

### \_messageStore

• **\_messageStore**: `default`\<`string`, [`ChatMessage`](../interfaces/ChatMessage.md)\>

#### Defined in

[src/gpt-api.ts:37](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/gpt-api.ts#L37)

## Accessors

### apiKey

• `get` **apiKey**(): `string`

#### Returns

`string`

#### Defined in

[src/gpt-api.ts:301](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/gpt-api.ts#L301)

• `set` **apiKey**(`apiKey`): `void`

#### Parameters

| Name     | Type     |
| :------- | :------- |
| `apiKey` | `string` |

#### Returns

`void`

#### Defined in

[src/gpt-api.ts:305](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/gpt-api.ts#L305)

---

### model

• `get` **model**(): `string`

#### Returns

`string`

#### Defined in

[src/gpt-api.ts:309](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/gpt-api.ts#L309)

• `set` **model**(`model`): `void`

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `model` | `string` |

#### Returns

`void`

#### Defined in

[src/gpt-api.ts:313](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/gpt-api.ts#L313)

## Methods

### loadMessages

▸ **loadMessages**(`messageList`): `Promise`\<`void`\>

Preloads conversation history into the message store.

#### Parameters

| Name          | Type                                            |
| :------------ | :---------------------------------------------- |
| `messageList` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/gpt-api.ts:432](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/gpt-api.ts#L432)

---

### sendMessage

▸ **sendMessage**(`text`, `opts?`): `Promise`\<[`ChatMessage`](../interfaces/ChatMessage.md)\>

Sends a prompt and returns the assistant reply.
Supports optional streaming via `opts.onProgress`.

#### Parameters

| Name   | Type                                                     |
| :----- | :------------------------------------------------------- |
| `text` | `string`                                                 |
| `opts` | [`SendMessageOptions`](../modules.md#sendmessageoptions) |

#### Returns

`Promise`\<[`ChatMessage`](../interfaces/ChatMessage.md)\>

#### Defined in

[src/gpt-api.ts:120](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/gpt-api.ts#L120)
