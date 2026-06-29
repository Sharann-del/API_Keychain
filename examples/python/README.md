# API Keychain — Python example

Requires: `pip install openai`

```sh
export KEYCHAIN_KEY="ak-your-key"
export GATEWAY_URL="http://localhost:8000"
python chat.py
```

```python
"""Chat completion through API Keychain using the OpenAI Python SDK."""

import os

from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("GATEWAY_URL", "http://localhost:8000") + "/v1",
    api_key=os.environ["KEYCHAIN_KEY"],
)

response = client.chat.completions.create(
    model="keychain-high",  # keychain-low | keychain-medium | keychain-high
    messages=[
        {"role": "user", "content": "Explain quantum tunneling in two sentences."}
    ],
)

print(response.choices[0].message.content)
```
