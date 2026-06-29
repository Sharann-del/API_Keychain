"""Anthropic Messages API ↔ OpenAI Chat Completions translation.

Claude Code speaks the Anthropic Messages protocol (POST /v1/messages).
The gateway routes through OpenAI-compatible upstream providers, so this
module converts request bodies and responses at the edge.
"""
from __future__ import annotations
import json
import uuid
from typing import Any, AsyncIterator, Dict, List, Optional
from fastapi.responses import JSONResponse


def resolve_effort(body: Dict[str, Any]) -> str:
    model = (body.get("model") or "").lower()
    if model.startswith("keychain-"):
        tier = model.split("-", 1)[1]
        if tier in ("low", "medium", "high"):
            return tier
    output_config = body.get("output_config") or {}
    effort = output_config.get("effort")
    if effort in ("low", "medium", "high"):
        return effort
    if "haiku" in model:
        return "low"
    if "opus" in model:
        return "high"
    if "sonnet" in model:
        return "medium"
    return "medium"


def extract_system(body: Dict[str, Any]) -> Optional[str]:
    system = body.get("system")
    if system is None:
        return None
    if isinstance(system, str):
        return system
    if isinstance(system, list):
        parts: List[str] = []
        for block in system:
            if isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text", ""))
            elif isinstance(block, str):
                parts.append(block)
        return "\n".join(parts) if parts else None
    return None


def _tool_result_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return _blocks_to_text(content)
    if content is not None:
        return json.dumps(content)
    return ""


def _blocks_to_text(blocks: List[Any]) -> str:
    parts: List[str] = []
    for block in blocks:
        if not isinstance(block, dict):
            continue
        if block.get("type") == "text":
            parts.append(block.get("text", ""))
    return "\n".join(parts)


def anthropic_to_openai_body(body: Dict[str, Any]) -> Dict[str, Any]:
    messages: List[Dict[str, Any]] = []
    system_text = extract_system(body)
    if system_text:
        messages.append({"role": "system", "content": system_text})

    for msg in body.get("messages") or []:
        role = msg.get("role")
        content = msg.get("content")
        if role == "user":
            if isinstance(content, str):
                messages.append({"role": "user", "content": content})
            elif isinstance(content, list):
                tool_results = [b for b in content if isinstance(b, dict) and b.get("type") == "tool_result"]
                other = [b for b in content if isinstance(b, dict) and b.get("type") != "tool_result"]
                if tool_results and not other:
                    for tr in tool_results:
                        messages.append({"role": "tool", "tool_call_id": tr.get("tool_use_id", ""), "content": _tool_result_text(tr.get("content"))})
                else:
                    text_parts: List[str] = []
                    for block in content:
                        if not isinstance(block, dict):
                            continue
                        if block.get("type") == "text":
                            text_parts.append(block.get("text", ""))
                        elif block.get("type") == "tool_result":
                            text_parts.append(_tool_result_text(block.get("content")))
                    if text_parts:
                        messages.append({"role": "user", "content": "\n".join(text_parts)})
        elif role == "assistant":
            if isinstance(content, str):
                messages.append({"role": "assistant", "content": content})
            elif isinstance(content, list):
                text_parts: List[str] = []
                tool_calls: List[Dict[str, Any]] = []
                for block in content:
                    if not isinstance(block, dict):
                        continue
                    if block.get("type") == "text":
                        text_parts.append(block.get("text", ""))
                    elif block.get("type") == "tool_use":
                        tool_calls.append({"id": block.get("id", ""), "type": "function", "function": {"name": block.get("name", ""), "arguments": json.dumps(block.get("input") or {})}})
                asst: Dict[str, Any] = {"role": "assistant"}
                asst["content"] = "\n".join(text_parts) if text_parts else None
                if tool_calls:
                    asst["tool_calls"] = tool_calls
                messages.append(asst)

    out: Dict[str, Any] = {"messages": messages}
    if body.get("max_tokens") is not None:
        out["max_tokens"] = body["max_tokens"]
    if body.get("temperature") is not None:
        out["temperature"] = body["temperature"]
    if body.get("top_p") is not None:
        out["top_p"] = body["top_p"]
    if body.get("stream"):
        out["stream"] = True

    tools = body.get("tools")
    if tools:
        openai_tools: List[Dict[str, Any]] = []
        for tool in tools:
            if not isinstance(tool, dict):
                continue
            name = tool.get("name")
            if not name:
                continue
            schema = tool.get("input_schema") or {"type": "object", "properties": {}}
            openai_tools.append({"type": "function", "function": {"name": name, "description": tool.get("description") or "", "parameters": schema}})
        if openai_tools:
            out["tools"] = openai_tools

    return out


def openai_to_anthropic_message(openai_resp: Dict[str, Any], model: str) -> Dict[str, Any]:
    choice = (openai_resp.get("choices") or [{}])[0]
    message = choice.get("message") or {}
    finish_reason = choice.get("finish_reason")
    content_blocks: List[Dict[str, Any]] = []
    msg_content = message.get("content")
    if msg_content:
        content_blocks.append({"type": "text", "text": msg_content})
    for tc in message.get("tool_calls") or []:
        func = tc.get("function") or {}
        args_str = func.get("arguments") or "{}"
        try:
            args = json.loads(args_str)
        except json.JSONDecodeError:
            args = {"raw": args_str}
        content_blocks.append({"type": "tool_use", "id": tc.get("id", f"toolu_{uuid.uuid4().hex[:24]}"), "name": func.get("name", ""), "input": args})
    if not content_blocks:
        content_blocks.append({"type": "text", "text": ""})
    stop_reason_map = {"stop": "end_turn", "length": "max_tokens", "tool_calls": "tool_use", "content_filter": "end_turn"}
    stop_reason = stop_reason_map.get(finish_reason or "", "end_turn")
    usage_raw = openai_resp.get("usage") or {}
    usage = {"input_tokens": usage_raw.get("prompt_tokens", 0), "output_tokens": usage_raw.get("completion_tokens", 0)}
    msg_id = openai_resp.get("id", "")
    anthropic_id = ("msg_" + msg_id[8:]) if msg_id.startswith("chatcmpl") else ("msg_" + uuid.uuid4().hex[:24])
    return {"id": anthropic_id, "type": "message", "role": "assistant", "model": model, "content": content_blocks, "stop_reason": stop_reason, "stop_sequence": None, "usage": usage}


def anthropic_error(status_code: int, message: str, error_type: str = "api_error") -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"type": "error", "error": {"type": error_type, "message": message}})


def _sse_event(event_type: str, data: Dict[str, Any]) -> bytes:
    return f"event: {event_type}\ndata: {json.dumps(data)}\n\n".encode()


async def convert_openai_stream_to_anthropic(openai_stream: AsyncIterator[bytes], model: str) -> AsyncIterator[bytes]:
    msg_id = "msg_" + uuid.uuid4().hex[:24]
    text_block_started = False
    text_block_index = 0
    tool_blocks: Dict[int, Dict[str, Any]] = {}
    finish_reason: Optional[str] = None
    output_tokens = 0
    message_start_sent = False

    async for chunk in openai_stream:
        text = chunk.decode("utf-8", errors="replace")
        for line in text.split("\n"):
            if not line.startswith("data: "):
                continue
            payload = line[6:].strip()
            if payload == "[DONE]":
                continue
            try:
                data = json.loads(payload)
            except json.JSONDecodeError:
                continue

            if not message_start_sent:
                yield _sse_event("message_start", {"type": "message_start", "message": {"id": msg_id, "type": "message", "role": "assistant", "model": model, "content": [], "usage": {"input_tokens": 0, "output_tokens": 0}}})
                message_start_sent = True

            choice = (data.get("choices") or [{}])[0]
            delta = choice.get("delta") or {}
            if choice.get("finish_reason"):
                finish_reason = choice.get("finish_reason")
            usage = data.get("usage") or {}
            if usage.get("completion_tokens"):
                output_tokens = usage.get("completion_tokens", output_tokens)

            content_delta = delta.get("content")
            if content_delta:
                if not text_block_started:
                    yield _sse_event("content_block_start", {"type": "content_block_start", "index": text_block_index, "content_block": {"type": "text", "text": ""}})
                    text_block_started = True
                yield _sse_event("content_block_delta", {"type": "content_block_delta", "index": text_block_index, "delta": {"type": "text_delta", "text": content_delta}})

            for tc_delta in delta.get("tool_calls") or []:
                idx = tc_delta.get("index", 0)
                block_idx = text_block_index + 1 + idx
                if idx not in tool_blocks:
                    tool_blocks[idx] = {"block_index": block_idx, "id": tc_delta.get("id", f"toolu_{uuid.uuid4().hex[:24]}"), "name": "", "arguments": "", "started": False}
                block = tool_blocks[idx]
                if tc_delta.get("id"):
                    block["id"] = tc_delta["id"]
                func = tc_delta.get("function") or {}
                if func.get("name"):
                    block["name"] = func["name"]
                if func.get("arguments"):
                    block["arguments"] += func["arguments"]
                if not block["started"] and block["name"]:
                    yield _sse_event("content_block_start", {"type": "content_block_start", "index": block_idx, "content_block": {"type": "tool_use", "id": block["id"], "name": block["name"], "input": {}}})
                    block["started"] = True
                if block["started"] and func.get("arguments"):
                    yield _sse_event("content_block_delta", {"type": "content_block_delta", "index": block_idx, "delta": {"type": "input_json_delta", "partial_json": func["arguments"]}})

    if not message_start_sent:
        yield _sse_event("message_start", {"type": "message_start", "message": {"id": msg_id, "type": "message", "role": "assistant", "model": model, "content": [], "usage": {"input_tokens": 0, "output_tokens": 0}}})

    if text_block_started:
        yield _sse_event("content_block_stop", {"type": "content_block_stop", "index": text_block_index})

    for block in tool_blocks.values():
        if block["started"]:
            yield _sse_event("content_block_stop", {"type": "content_block_stop", "index": block["block_index"]})

    stop_reason_map = {"stop": "end_turn", "length": "max_tokens", "tool_calls": "tool_use", "content_filter": "end_turn"}
    anthropic_stop = stop_reason_map.get(finish_reason or "", "end_turn")
    yield _sse_event("message_delta", {"type": "message_delta", "delta": {"stop_reason": anthropic_stop, "stop_sequence": None}, "usage": {"output_tokens": output_tokens}})
    yield _sse_event("message_stop", {"type": "message_stop"})


def estimate_input_tokens(body: Dict[str, Any]) -> int:
    return max(1, len(json.dumps(body)) // 4)
