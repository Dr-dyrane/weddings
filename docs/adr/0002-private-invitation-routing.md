# ADR 0002: Private invitation routing

Status: accepted

## Decision

Personalization uses `/{weddingSlug}/invite/{opaqueToken}`. Production tokens contain at least 128 random bits, are hashed at rest, revocable, and excluded from telemetry. The personalized route emits `noindex, nofollow`. Query-string names are prohibited.

## Consequences

Public and private sharing are explicit products. An invalid credential falls back without disclosing a former recipient. The checked-in seed credential is simulation-only and is not a production security mechanism.
