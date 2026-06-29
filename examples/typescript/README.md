# API Keychain — TypeScript example

```sh
npm install openai
export KEYCHAIN_KEY="ak-your-key"
export GATEWAY_URL="http://localhost:8000"
npx tsx chat.ts
```

```typescript
import OpenAI from "openai";

const baseURL = `${process.env.GATEWAY_URL ?? "http://localhost:8000"}/v1`;
const apiKey = process.env.KEYCHAIN_KEY;
if (!apiKey) throw new Error("Set KEYCHAIN_KEY");

const client = new OpenAI({ baseURL, apiKey });

const response = await client.chat.completions.create({
  model: "keychain-medium",
  messages: [{ role: "user", content: "Draft a launch tweet for an API gateway." }],
});

console.log(response.choices[0]?.message?.content);
```
