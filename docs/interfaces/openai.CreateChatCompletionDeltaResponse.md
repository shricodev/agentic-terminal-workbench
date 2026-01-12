[composio-agent](../readme.md) / [Exports](../modules.md) / [openai](../modules/openai.md) / CreateChatCompletionDeltaResponse

# Interface: CreateChatCompletionDeltaResponse

[openai](../modules/openai.md).CreateChatCompletionDeltaResponse

## Table of contents

### Properties

- [choices](openai.CreateChatCompletionDeltaResponse.md#choices)
- [created](openai.CreateChatCompletionDeltaResponse.md#created)
- [id](openai.CreateChatCompletionDeltaResponse.md#id)
- [model](openai.CreateChatCompletionDeltaResponse.md#model)
- [object](openai.CreateChatCompletionDeltaResponse.md#object)

## Properties

### choices

• **choices**: [\{ `delta`: \{ `content?`: `string` ; `role`: [`Role`](../modules.md#role) } ; `finish_reason`: `string` ; `index`: `number` }]

#### Defined in

[src/types.ts:160](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L160)

---

### created

• **created**: `number`

#### Defined in

[src/types.ts:158](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L158)

---

### id

• **id**: `string`

#### Defined in

[src/types.ts:156](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L156)

---

### model

• **model**: `string`

#### Defined in

[src/types.ts:159](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L159)

---

### object

• **object**: `"chat.completion.chunk"`

#### Defined in

[src/types.ts:157](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L157)
