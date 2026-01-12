[composio-agent](../readme.md) / [Exports](../modules.md) / ChatGPTError

# Class: ChatGPTError

## Hierarchy

- `Error`

  ↳ **`ChatGPTError`**

## Table of contents

### Constructors

- [constructor](ChatGPTError.md#constructor)

### Properties

- [accountId](ChatGPTError.md#accountid)
- [isFinal](ChatGPTError.md#isfinal)
- [statusCode](ChatGPTError.md#statuscode)
- [statusText](ChatGPTError.md#statustext)

## Constructors

### constructor

• **new ChatGPTError**(`message?`): [`ChatGPTError`](ChatGPTError.md)

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `message?` | `string` |

#### Returns

[`ChatGPTError`](ChatGPTError.md)

#### Inherited from

Error.constructor

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1082

• **new ChatGPTError**(`message?`, `options?`): [`ChatGPTError`](ChatGPTError.md)

#### Parameters

| Name       | Type           |
| :--------- | :------------- |
| `message?` | `string`       |
| `options?` | `ErrorOptions` |

#### Returns

[`ChatGPTError`](ChatGPTError.md)

#### Inherited from

Error.constructor

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1082

## Properties

### accountId

• `Optional` **accountId**: `string`

#### Defined in

[src/types.ts:80](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L80)

---

### isFinal

• `Optional` **isFinal**: `boolean`

#### Defined in

[src/types.ts:79](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L79)

---

### statusCode

• `Optional` **statusCode**: `number`

#### Defined in

[src/types.ts:77](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L77)

---

### statusText

• `Optional` **statusText**: `string`

#### Defined in

[src/types.ts:78](https://github.com/shricodev/gpt-agent-cli/blob/80f5eea01392a51f897f3e495f38c1cc53f86c4e/src/types.ts#L78)
