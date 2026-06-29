import OpenAI from "openai";

const baseURL = `${process.env.GATEWAY_URL ?? "http://localhost:8000"}/v1`;
const apiKey = process.env.KEYCHAIN_KEY;
if (!apiKey) throw new Error("Set KEYCHAIN_KEY");

const client = new OpenAI({ baseURL, apiKey });

const response = await client.chat.completions.create({
  model: "keychain-low",
  messages: [{ role: "user", content: "Reply with exactly: ok" }],
});

console.log(response.choices[0]?.message?.content);
