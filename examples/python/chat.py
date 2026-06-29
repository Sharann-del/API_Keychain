"""Chat completion through API Keychain using the OpenAI Python SDK."""

import os

from openai import OpenAI


def main() -> None:
    base = os.environ.get("GATEWAY_URL", "http://localhost:8000")
    api_key = os.environ["KEYCHAIN_KEY"]

    client = OpenAI(base_url=f"{base}/v1", api_key=api_key)

    response = client.chat.completions.create(
        model="keychain-high",
        messages=[
            {
                "role": "user",
                "content": "Explain quantum tunneling in two sentences.",
            }
        ],
    )

    print(response.choices[0].message.content)


if __name__ == "__main__":
    main()
