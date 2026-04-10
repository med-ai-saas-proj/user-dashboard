---
name: user-dashboard
description: Venera user-dashboard (React 19 + Vite) — routes, API integration, streaming, WebGPU inference, deployment
version: 1.0.0
source: local-git-analysis
last_verified: 2026-04-10
---

# Venera User Dashboard — Development Guide

React 19 frontend for the Venera API Hub. Served at `https://hub.venerian.space/`.

## 1. Tech Stack

- **Framework**: React 19.1.1 + React Router 7.9.5
- **Build**: Vite 7.1.7 (use `npx vite build` — tsc has pre-existing errors)
- **UI**: Tailwind CSS 4.1.16 + Radix UI primitives + lucide-react
- **State**: Zustand 5.0.8 (auth, chat, ai-search, api-keys stores)
- **HTTP**: Axios 1.13.2 with interceptors
- **Data**: TanStack Query 5.90.6
- **Auth**: keycloak-js 26.2.1 (SSO)
- **Streaming**: `@microsoft/fetch-event-source` 2.0.1 (SSE)
- **Local LLM**: `@huggingface/transformers` 3.8.1 (WebGPU Qwen2.5-VL-3B for vision)
- **i18n**: i18next 25.7.4
- **Lint**: Biome 2.3.4
- **Package manager**: pnpm 10.13.1

## 2. Routes (32 pages)

### Auth
- `/login` — Keycloak SSO entry point
- `/` — redirects to `/chat`

### AI / LLM (streaming)
- `/chat` — Multi-turn chat (SSE, Keycloak JWT auth)
- `/ai-search` — "Quick Search" + "Deep Research" modes (SSE)
- `/ehr-summary` — EHR → narrative (SSE)
- `/rx-advisor` — Drug interaction analysis (SSE)

### Healthcare Data
- `/ehr-converter` — HL7v2/CDA/HL7v3/BHXH4210 ↔ FHIR
- `/document-to-fhir` — Doc image → FHIR via OCR
- `/ehr-overview` — Aggregated patient overview + narrative
- `/patient-history` — Patient CRUD
- `/wearable-data` — Wearable ingestion

### Clinical Intelligence
- `/medical-image` — Image analysis (multipart upload)
- `/blood-panel` — Lab marker interpretation
- `/health-score` — 20-100 health scoring
- `/symptom-checker` — Differential diagnosis
- `/gene-decoder` — FASTA/FASTQ parsing + variant analysis

### Infrastructure
- `/clinic-search` — Vietnamese clinic/doctor directory
- `/knowledge-base` — Medical KB CRUD + BM25 search
- `/bhxh-validator` — Vietnamese social insurance XML validator
- `/voice-transcribe` — File upload + real-time WebSocket (Whisper/Cohere)
- `/data-masking` — PHI scrubbing + cross-facility search

### Advanced
- `/digital-twin` — Patient-centric unified model
- `/federated-learning` — Multi-facility ML projects
- `/a2ui` — AI-to-UI generation playground
- `/cross-search` — Cross-provider patient search
- `/public-health` — Population statistics

### Developer / Admin
- `/api-keys` — API key management
- `/api-reference` — Scalar OpenAPI explorer
- `/api-flow-builder` — Compose APIs into DAG workflows
- `/dashboard-builder` — Custom dashboards
- `/architecture` — System architecture visualization
- `/integration` — Integration hub
- `/settings`, `/billing`, `/upgrade`

## 3. API Integration

**Base URL:** `VITE_BASE_API_URL` (production: `https://hub.venerian.space/backend`)

**Routes config:** `src/config/api-routes.ts` — centralized endpoint definitions. All routes have been verified against the actual backend DTOs.

**HTTP client:** `src/query/api-client.ts`
- Axios instance with Keycloak interceptor (adds `Authorization: Bearer <jwt>`)
- Auto-handles 401 via `handleUnauthorized()`
- `Content-Type: application/json` default

**Streaming:** `src/lib/streaming/use-stream.ts` + `src/lib/streaming/base-stream.ts`
- Uses `@microsoft/fetch-event-source` (not native EventSource — supports POST + auth headers)
- Events: `connected`, `part_delta`, `final_result`

### Backend Endpoints Called (verified 2026-04-10)

All endpoints prefixed with `service/api/v1/`:

| Endpoint | Method | Auth | Notes |
|----------|--------|------|-------|
| `chat` | POST | Keycloak JWT | Streaming, NOT X-Api-Key |
| `ai_search` | POST | X-Api-Key | Streaming, `query` is string, needs `model` |
| `ehr_summarize` | POST | X-Api-Key | Streaming, `input_ehr` is discriminated union `{type, custom_json/fhir/vn_moh}` |
| `rx_advisor` | POST | X-Api-Key | Streaming, fields are `ehr`, `prescription` (NOT `input_*`) |
| `ehr_converter/convert` | POST | X-Api-Key | auto-detects format |
| `ehr_converter/convert/fhir-to-hl7v2` | POST | X-Api-Key | reverse conversion |
| `ehr_converter/validate` | POST | X-Api-Key | |
| `ehr_converter/convert/document` | POST | X-Api-Key | multipart file |
| `ehr_converter/health` | GET | none | |
| `medical_image/describe` | POST | X-Api-Key | multipart file |
| `blood_panel/analyze` | POST | X-Api-Key | `markers` is array |
| `health_score/evaluate` | POST | X-Api-Key | |
| `symptom_checker/check` | POST | X-Api-Key | |
| `gene_decoder/decode` | POST | X-Api-Key | field is `data` |
| `gene_decoder/analyze` | POST | X-Api-Key | field is `sequence` |
| `voice_transcribe` | POST | X-Api-Key | multipart audio |
| `voice_transcribe/ws` | WS | query param token | real-time streaming |
| `knowledge_base` | GET/POST/PUT/DELETE | X-Api-Key | |
| `knowledge_base/{id}/ingest` | POST | X-Api-Key | |
| `knowledge_base/search` | POST | X-Api-Key | |
| `clinic_search/provinces` | GET | none | |
| `clinic_search/search` | GET | none | query: `q`, `province` |
| `clinic_search/recommend` | POST | none | `symptoms` is STRING not array |
| `bhxh_validator/validate` | POST | X-Api-Key | |
| `patient` | POST/GET | X-Api-Key | `dob`, `gender_at_birth` enum `M/F/O/U` |
| `public_health/statistics` | POST | X-Api-Key | |
| `data_masking/mask` | POST | X-Api-Key | (no `/hash` endpoint) |
| `data_masking/query` | POST | X-Api-Key | |
| `data_masking/facility/register` | POST | X-Api-Key | |
| `data_masking/facility/search` | POST | X-Api-Key | |
| `ehr_overview/{id}` | GET | X-Api-Key | |
| `ehr_overview/{id}/narrative` | POST | X-Api-Key | LLM |
| `cross_search/search` | POST | X-Api-Key | |
| `cross_search/pull` | POST | X-Api-Key | |
| `cross_search/pull_and_convert` | POST | X-Api-Key | |
| `cross_search/network_stats` | GET | X-Api-Key | |
| `digital_twin/{id}` | GET | none | |
| `federated/projects` | GET/POST | X-Api-Key | |
| `a2ui/generate` | POST | X-Api-Key | |
| `playground/seed` | POST | none | |
| `playground/status` | GET | none | |

### Management API

Base: `management/api/v1/`
- `api-keys` (CRUD) — Keycloak JWT required
- `service/docs/openapi.json` — OpenAPI spec for Scalar reference

## 4. WebGPU Local Inference

File: `src/lib/webgpu-inference.ts`
- **Model:** `Qwen/Qwen2.5-VL-3B-Instruct` via Hugging Face Transformers.js
- **Device:** WebGPU (browser GPU acceleration)
- **Task:** Image-text-to-text generation (multimodal)
- **API:** `loadWebGPUModel()`, `generateText()`, `unloadModel()`
- **Use case:** Offline clinical vision analysis without server round-trip

## 5. Building & Deployment

### Local Dev
```bash
pnpm install
pnpm dev  # http://localhost:5173
```

### Production Build

**CRITICAL: ALL 4 VITE_ env vars are REQUIRED.** Missing any causes login/API failures.

```bash
VITE_BASE_API_URL=https://hub.venerian.space/backend \
VITE_KEYCLOAK_URL=https://hub.venerian.space/auth-server \
VITE_KEYCLOAK_REALM=venera \
VITE_KEYCLOAK_CLIENT_ID=venera-app \
npx vite build
```

Use `npx vite build` NOT `pnpm build` — the latter runs `tsc` which fails with pre-existing type errors.

### Manual Deploy to hub.venerian.space

```bash
# 1. Build
tar czf /tmp/ud.tar.gz dist/
gcloud compute scp /tmp/ud.tar.gz venera-hub-demo:/tmp/ud.tar.gz --zone=us-central1-a

# 2. Deploy to build-output/ (NOT dist/) and rebuild nginx
gcloud compute ssh venera-hub-demo --zone=us-central1-a --command="
  cd /home/minh/deployment/user-dashboard
  rm -rf build-output && tar xzf /tmp/ud.tar.gz && mv dist build-output
  cd /home/minh/deployment && docker compose up -d --build nginx
"
```

**DO NOT use `restart`** — nginx bakes files into image at build time, need `--build nginx`.

### Deployment Gotchas
- Frontend is baked into nginx image — deploy to `build-output/`, then `--build nginx`
- Missing any `VITE_*` env var → runtime config is wrong (login redirects to localhost)
- nginx can disappear after `docker compose up -d --build backend` — always re-run `docker compose up -d nginx` after backend deploy

## 6. Known Issues (2026-04-10)

- **AI Search broken in production** — backend needs real `GOOGLE_PROGRAMMABLE_SEARCH_API_KEY` (currently `placeholder` → 500 on agent tool call)
- **No automated tests** — no test files exist yet in `src/`. Adding Playwright E2E would benefit critical user flows.
- **`pnpm build` fails** due to pre-existing TypeScript errors — use `npx vite build` instead

## 7. Feature Requests Pending
- Real-time speech-to-text merged with "Upload Audio File" card (DONE — see `src/routes/voice-transcribe.tsx`)
- Search boxes in Playground and API Flow Builder (DONE — see `src/routes/api-flow-builder.tsx`)
