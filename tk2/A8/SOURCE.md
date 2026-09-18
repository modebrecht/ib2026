# A8 canonical source

`tk2/A8/` is the sole editable and runtime source of truth for TK2 A8 in IB2026.

GitHub Pages DEV and Vercel deploy this checked-in directory directly. Builds copy and validate it; they do not fetch, patch, inject, or reassemble A8 from another repository.

## Historical provenance

A8 was originally migrated from `modebrecht/shortcut-quest` during the canonical-source migration. That repository is historical provenance only and is no longer used by IB2026 A8 builds or deployment.

The narrative-fly lifecycle cleanup, classroom PDF filename (`A8-<student>.pdf`), battle/runtime integrations, styles, scripts, and assets are maintained directly in this directory.
