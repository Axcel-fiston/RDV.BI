# Stoplight setup

This project now includes an OpenAPI contract at:

- `backend/docs/openapi.yaml`

## Import into Stoplight

1. Open Stoplight Studio or the Stoplight web workspace.
2. Import an existing OpenAPI file.
3. Select `backend/docs/openapi.yaml`.
4. Set the server to `http://localhost:4000` for local development.

## What this contract covers

- Public institution registration and booking endpoints
- Auth endpoints for login and refresh
- Admin endpoints for institutions, services, time slots, counters, and appointments
- JWT bearer authentication for protected routes

## Current limitations

- The spec documents the current backend surface, including the temporary bootstrap endpoint.
- Some responses are based on the current entity serialization shape, because the backend still returns JPA entities directly instead of dedicated response DTOs.
- If you add staff-only queue endpoints next, update `backend/docs/openapi.yaml` at the same time so Stoplight remains the source of truth.

## Recommended workflow

1. Treat `backend/docs/openapi.yaml` as the contract source of truth.
2. Import that file into Stoplight.
3. Update the file whenever backend endpoints or payloads change.
