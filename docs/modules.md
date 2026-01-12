[composio-agent](readme.md) / Exports

# composio-agent

## Table of contents

### Namespaces

- [openai](modules/openai.md)

### Classes

- [ChatGPTAPI](classes/ChatGPTAPI.md)
- [ChatGPTError](classes/ChatGPTError.md)

### Interfaces

- [ChatMessage](interfaces/ChatMessage.md)

### Type Aliases

- [ChatGPTAPIOptions](modules.md#chatgptapioptions)
- [ContentType](modules.md#contenttype)
- [ConversationJSONBody](modules.md#conversationjsonbody)
- [ConversationResponseEvent](modules.md#conversationresponseevent)
- [FetchFn](modules.md#fetchfn)
- [GetMessageByIdFunction](modules.md#getmessagebyidfunction)
- [Message](modules.md#message)
- [MessageActionType](modules.md#messageactiontype)
- [MessageContent](modules.md#messagecontent)
- [MessageMetadata](modules.md#messagemetadata)
- [Prompt](modules.md#prompt)
- [PromptContent](modules.md#promptcontent)
- [Role](modules.md#role)
- [SendMessageBrowserOptions](modules.md#sendmessagebrowseroptions)
- [SendMessageOptions](modules.md#sendmessageoptions)
- [UpsertMessageFunction](modules.md#upsertmessagefunction)

## Type Aliases

### ChatGPTAPIOptions

Ƭ **ChatGPTAPIOptions**: `Object`

#### Type declaration

| Name                 | Type                                                                                                                            |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| `apiBaseUrl?`        | `string`                                                                                                                        |
| `apiKey`             | `string`                                                                                                                        |
| `completionParams?`  | `Partial`\<`Omit`\<[`CreateChatCompletionRequest`](interfaces/openai.CreateChatCompletionRequest.md), `"messages"` \| `"n"`\>\> |
| `debug?`             | `boolean`                                                                                                                       |
| `fetch?`             | [`FetchFn`](modules.md#fetchfn)                                                                                                 |
| `getMessageById?`    | [`GetMessageByIdFunction`](modules.md#getmessagebyidfunction)                                                                   |
| `maxModelTokens?`    | `number`                                                                                                                        |
| `maxResponseTokens?` | `number`                                                                                                                        |
| `messageStore?`      | `Keyv`                                                                                                                          |
| `model?`             | `string`                                                                                                                        |
| `systemMessage?`     | `string`                                                                                                                        |
| `upsertMessage?`     | [`UpsertMessageFunction`](modules.md#upsertmessagefunction)                                                                     |

#### Defined in

[src/types.ts:7](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L7)

---

### ContentType

Ƭ **ContentType**: `"text"`

#### Defined in

[src/types.ts:118](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L118)

---

### ConversationJSONBody

Ƭ **ConversationJSONBody**: `Object`

#### Type declaration

| Name                | Type                            |
| :------------------ | :------------------------------ |
| `action`            | `string`                        |
| `conversation_id?`  | `string`                        |
| `messages`          | [`Prompt`](modules.md#prompt)[] |
| `model`             | `string`                        |
| `parent_message_id` | `string`                        |

#### Defined in

[src/types.ts:90](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L90)

---

### ConversationResponseEvent

Ƭ **ConversationResponseEvent**: `Object`

#### Type declaration

| Name               | Type                            |
| :----------------- | :------------------------------ |
| `conversation_id?` | `string`                        |
| `error?`           | `string` \| `null`              |
| `message?`         | [`Message`](modules.md#message) |

#### Defined in

[src/types.ts:128](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L128)

---

### FetchFn

Ƭ **FetchFn**: typeof `fetch`

#### Defined in

[src/types.ts:5](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L5)

---

### GetMessageByIdFunction

Ƭ **GetMessageByIdFunction**: (`id`: `string`) => `Promise`\<[`ChatMessage`](interfaces/ChatMessage.md)\>

#### Type declaration

▸ (`id`): `Promise`\<[`ChatMessage`](interfaces/ChatMessage.md)\>

##### Parameters

| Name | Type     |
| :--- | :------- |
| `id` | `string` |

##### Returns

`Promise`\<[`ChatMessage`](interfaces/ChatMessage.md)\>

#### Defined in

[src/types.ts:84](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L84)

---

### Message

Ƭ **Message**: `Object`

#### Type declaration

| Name          | Type                                            |
| :------------ | :---------------------------------------------- |
| `content`     | [`MessageContent`](modules.md#messagecontent)   |
| `create_time` | `string` \| `null`                              |
| `end_turn`    | `null`                                          |
| `id`          | `string`                                        |
| `metadata`    | [`MessageMetadata`](modules.md#messagemetadata) |
| `recipient`   | `string`                                        |
| `role`        | [`Role`](modules.md#role)                       |
| `update_time` | `string` \| `null`                              |
| `user`        | `string` \| `null`                              |
| `weight`      | `number`                                        |

#### Defined in

[src/types.ts:134](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L134)

---

### MessageActionType

Ƭ **MessageActionType**: `"next"` \| `"variant"`

#### Defined in

[src/types.ts:50](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L50)

---

### MessageContent

Ƭ **MessageContent**: `Object`

#### Type declaration

| Name           | Type       |
| :------------- | :--------- |
| `content_type` | `string`   |
| `parts`        | `string`[] |

#### Defined in

[src/types.ts:147](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L147)

---

### MessageMetadata

Ƭ **MessageMetadata**: `any`

#### Defined in

[src/types.ts:152](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L152)

---

### Prompt

Ƭ **Prompt**: `Object`

#### Type declaration

| Name      | Type                                        |
| :-------- | :------------------------------------------ |
| `content` | [`PromptContent`](modules.md#promptcontent) |
| `id`      | `string`                                    |
| `role`    | [`Role`](modules.md#role)                   |

#### Defined in

[src/types.ts:107](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L107)

---

### PromptContent

Ƭ **PromptContent**: `Object`

#### Type declaration

| Name           | Type                                    |
| :------------- | :-------------------------------------- |
| `content_type` | [`ContentType`](modules.md#contenttype) |
| `parts`        | `string`[]                              |

#### Defined in

[src/types.ts:120](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L120)

---

### Role

Ƭ **Role**: `"user"` \| `"assistant"` \| `"system"`

#### Defined in

[src/types.ts:3](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L3)

---

### SendMessageBrowserOptions

Ƭ **SendMessageBrowserOptions**: `Object`

#### Type declaration

| Name               | Type                                                                      |
| :----------------- | :------------------------------------------------------------------------ |
| `abortSignal?`     | `AbortSignal`                                                             |
| `action?`          | [`MessageActionType`](modules.md#messageactiontype)                       |
| `conversationId?`  | `string`                                                                  |
| `messageId?`       | `string`                                                                  |
| `onProgress?`      | (`partialResponse`: [`ChatMessage`](interfaces/ChatMessage.md)) => `void` |
| `parentMessageId?` | `string`                                                                  |
| `timeoutMs?`       | `number`                                                                  |

#### Defined in

[src/types.ts:52](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L52)

---

### SendMessageOptions

Ƭ **SendMessageOptions**: `Object`

#### Type declaration

| Name               | Type                                                                      |
| :----------------- | :------------------------------------------------------------------------ |
| `abortSignal?`     | `AbortSignal`                                                             |
| `messageId?`       | `string`                                                                  |
| `name?`            | `string`                                                                  |
| `onProgress?`      | (`partialResponse`: [`ChatMessage`](interfaces/ChatMessage.md)) => `void` |
| `parentMessageId?` | `string`                                                                  |
| `stream?`          | `boolean`                                                                 |
| `systemMessage?`   | `string`                                                                  |
| `timeoutMs?`       | `number`                                                                  |

#### Defined in

[src/types.ts:38](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L38)

---

### UpsertMessageFunction

Ƭ **UpsertMessageFunction**: (`message`: [`ChatMessage`](interfaces/ChatMessage.md)) => `Promise`\<`void`\>

#### Type declaration

▸ (`message`): `Promise`\<`void`\>

##### Parameters

| Name      | Type                                       |
| :-------- | :----------------------------------------- |
| `message` | [`ChatMessage`](interfaces/ChatMessage.md) |

##### Returns

`Promise`\<`void`\>

#### Defined in

[src/types.ts:87](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L87)
