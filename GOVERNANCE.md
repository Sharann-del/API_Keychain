# Governance

API Keychain is an open-source project distributed under the [MIT License](LICENSE).

## Project roles

### Maintainers

Current maintainer: **[Sharann Manojkumar](https://github.com/Sharann-del)** ([@Sharann-del](https://github.com/Sharann-del)).

Maintainers have write access to the repository. They:

- Review and merge pull requests
- Triage issues and security advisories
- Cut releases and update [CHANGELOG.md](CHANGELOG.md)
- Enforce the [Code of Conduct](CODE_OF_CONDUCT.md)

Maintainers are added by consensus among existing maintainers. There is no
fixed cap on maintainer count; active contributors with a track record of
quality PRs and community engagement are welcome candidates.

### Contributors

Anyone may contribute via pull requests, issues, and discussions. Contributors
retain copyright on their submissions and license them under the project MIT
license.

### Users

Users deploy and integrate API Keychain under the MIT terms. No CLA is required.

## Decision making

- **Routine changes** (bug fixes, docs, small features): merged by any
  maintainer after CI passes and at least one review when practical.
- **Architectural changes** (routing semantics, encryption format, breaking API
  changes): discussed in a GitHub issue or discussion before implementation.
  Breaking changes require a major version bump and CHANGELOG entry.
- **Security fixes**: handled privately per [SECURITY.md](SECURITY.md), then
  released with advisory credit.

There is no formal voting body. Disagreements are resolved through discussion;
if consensus cannot be reached, the longest-tenured maintainer makes a final
call.

## Release process

1. Update [CHANGELOG.md](CHANGELOG.md) under `[Unreleased]`.
2. Bump version in `main.py` (`app = FastAPI(..., version=...)`) and
   `package.json` if applicable.
3. Tag `vX.Y.Z` on `main`.
4. GitHub Actions [release workflow](.github/workflows/release.yml) publishes the
   release notes.

## Trademark

"API Keychain" is the project name. Third parties may fork and modify the
software under MIT terms but should not imply official endorsement without
permission.

## Changes to governance

This document may be updated via pull request. Substantive changes should be
open for at least one week before merge to allow community comment.
