from anthropic_adapter import (
    resolve_effort, anthropic_to_openai_body, openai_to_anthropic_message, estimate_input_tokens
)

def test_resolve_effort_by_model():
    assert resolve_effort({"model": "claude-haiku-4-5"}) == "low"
    assert resolve_effort({"model": "claude-sonnet-4-6"}) == "medium"
    assert resolve_effort({"model": "claude-opus-4-6"}) == "high"
    assert resolve_effort({"model": "keychain-high"}) == "high"

def test_anthropic_to_openai_basic():
    body = {"model": "claude-sonnet-4-6", "max_tokens": 100, "messages": [{"role": "user", "content": "Hello"}]}
    oai = anthropic_to_openai_body(body)
    assert oai["messages"][-1]["role"] == "user"
    assert oai["max_tokens"] == 100

def test_anthropic_to_openai_system():
    body = {"model": "x", "max_tokens": 10, "system": "You are helpful.", "messages": [{"role": "user", "content": "Hi"}]}
    oai = anthropic_to_openai_body(body)
    assert oai["messages"][0] == {"role": "system", "content": "You are helpful."}

def test_openai_to_anthropic_message():
    oai = {"id": "chatcmpl-test", "choices": [{"message": {"role": "assistant", "content": "Hi"}, "finish_reason": "stop"}], "usage": {"prompt_tokens": 5, "completion_tokens": 3}}
    msg = openai_to_anthropic_message(oai, "claude-sonnet-4-6")
    assert msg["type"] == "message"
    assert msg["stop_reason"] == "end_turn"
    assert msg["content"][0]["text"] == "Hi"

def test_estimate_tokens():
    assert estimate_input_tokens({"messages": [{"role": "user", "content": "Hello"}]}) > 0
