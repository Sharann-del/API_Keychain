## Summary

<!-- What does this PR change and why? Link related issues: Fixes #123 -->

## Type of change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing behavior to change)
- [ ] Documentation only
- [ ] CI / tooling

## Component

- [ ] Gateway (`main.py`, `router.py`, `registry.py`, `crypto.py`, `models.py`)
- [ ] Dashboard (`app/`, `components/`, `lib/`)
- [ ] Docs / examples / GitHub templates
- [ ] Other

## Test plan

<!-- How did you verify this? Include commands, screenshots, or curl examples. -->

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Gateway starts with required env vars (`MASTER_SECRET`, `SUPABASE_JWT_SECRET`)
- [ ] Manual test: <!-- describe -->

## Security checklist

- [ ] No secrets, `.env.local`, or provider keys committed
- [ ] Provider keys remain encrypted at rest; plaintext keys are not logged
- [ ] JWT / keychain key handling unchanged or reviewed

## Screenshots (if UI)

<!-- Optional -->
