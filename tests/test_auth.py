def test_chat_completions_no_auth(client):
    r = client.post("/v1/chat/completions", json={"messages": [{"role": "user", "content": "hi"}]})
    assert r.status_code == 401

def test_anthropic_messages_no_auth(client):
    r = client.post("/v1/messages", json={"model": "claude-sonnet-4-6", "max_tokens": 10, "messages": [{"role": "user", "content": "hi"}]})
    assert r.status_code == 401

def test_count_tokens_no_auth(client):
    r = client.post("/v1/messages/count_tokens", json={"model": "claude-sonnet-4-6", "messages": []})
    assert r.status_code == 401
