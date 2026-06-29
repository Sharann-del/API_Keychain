def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_providers(client):
    r = client.get("/providers")
    assert r.status_code == 200
    data = r.json()
    slugs = {p["provider"] for p in data["providers"]}
    assert "gemini" in slugs
    assert "groq" in slugs

def test_models(client):
    r = client.get("/models")
    assert r.status_code == 200
    tiers = r.json()["tiers"]
    assert "high" in tiers and "medium" in tiers and "low" in tiers
