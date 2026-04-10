---
name: user-dashboard
description: Venera user-dashboard (React 19 + Vite) — routes, API integration, streaming, WebGPU inference, deployment
version: 1.1.0
source: local-git-analysis
last_verified: 2026-04-10
---

# Venera User Dashboard — Development Guide

React 19 frontend for the Venera API Hub. Served at `https://hub.venerian.space/`.

## ⚠️ CRITICAL: Deploy via Git Only

**Production is deployed by `Venera-AI/api-hub-deployment.deploy.yaml`.** Pushing to `main` fires a `repository_dispatch` → SSH → `git reset --hard origin/main` on the VM → `npx vite build` with VITE_ env vars → rebuild nginx image → restart containers.

### DO NOT:
- ❌ Manually SCP `dist/` to the VM — wiped on next auto-deploy (minutes later)
- ❌ SSH in and edit files in `/home/minh/deployment/user-dashboard/` — `git reset --hard` throws them away
- ❌ Push to any branch other than `main` expecting production to update — only `main` triggers the deploy dispatch
- ❌ Run `pnpm build` — it runs `tsc` first, which fails with pre-existing type errors. Use `npx vite build`

### DO:
- ✅ Commit + push to `Venera-AI/user-dashboard` `main` branch. The CI does the rest.
- ✅ Verify with `gh run list -R Venera-AI/api-hub-deployment --workflow=deploy.yaml --limit 5`
- ✅ Check served bundle hash changes: `curl -s https://hub.venerian.space/ | grep -oE 'assets/index-[a-zA-Z0-9_-]+\.js'`

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

### Standard Production Deploy (CI/CD — always use this)

1. Commit locally on `main`: `git commit -am "feat: ..."`
2. `git push origin main`
3. `trigger-deploy.yaml` fires a `repository_dispatch` to `Venera-AI/api-hub-deployment`
4. Watch the deploy: `gh run watch -R Venera-AI/api-hub-deployment` (or `gh run list --limit 5`)
5. Verify after completion (typically 3-5 min):
   ```bash
   curl -s https://hub.venerian.space/ | grep -oE 'assets/index-[a-zA-Z0-9_-]+\.js'
   # Should be a NEW hash compared to before your push
   ```

The CI runs `npx vite build` with all required VITE_ env vars (`VITE_BASE_API_URL`, `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`) automatically — you do not need to set them locally for deploys.

### Local Production Build (for testing only)

```bash
VITE_BASE_API_URL=https://hub.venerian.space/backend \
VITE_KEYCLOAK_URL=https://hub.venerian.space/auth-server \
VITE_KEYCLOAK_REALM=venera \
VITE_KEYCLOAK_CLIENT_ID=venera-app \
npx vite build
```

- **Use `npx vite build`** NOT `pnpm build` — the latter runs `tsc` which fails with pre-existing type errors.
- **ALL 4 VITE_ vars required.** Missing any causes login redirect to localhost or API calls to wrong origin.
- This output is for **local verification only**. Do NOT SCP it to the VM (auto-deploy will wipe it).

### Emergency Manual Deploy (CI/CD broken)

Only use if `Venera-AI/api-hub-deployment.deploy.yaml` is broken and you cannot fix the workflow quickly. Always follow up with a git commit, or the next auto-deploy regresses your fix.

```bash
# 1. Build locally with VITE_ vars (see above)
# 2. Upload
tar czf /tmp/ud.tar.gz -C dist . && \
  gcloud compute scp /tmp/ud.tar.gz venera-hub-demo:/tmp/ud.tar.gz --zone=us-central1-a

# 3. Deploy to build-output/ (NOT dist/) and rebuild nginx
gcloud compute ssh venera-hub-demo --zone=us-central1-a --command='
  cd /home/minh/deployment/user-dashboard
  rm -rf build-output && mkdir build-output && tar xzf /tmp/ud.tar.gz -C build-output
  cd /home/minh/deployment && docker compose up -d --force-recreate --build nginx
'
```

### Why the frontend "disappears" after backend deploys

The frontend is **baked into the nginx Docker image** via `nginx.Dockerfile` (COPY build-output into /usr/share/nginx/html). This creates 3 failure modes:

1. `docker compose restart nginx` → serves OLD frontend (image unchanged)
2. `docker compose up -d nginx` (no `--build`) → serves OLD frontend (cached image)
3. `docker compose up -d --build nginx` without `--force-recreate` → Docker layer cache may reuse the COPY layer if `build-output/` content didn't change from its perspective

The CI fix uses `docker compose up -d --force-recreate nginx` which always recreates the container.

Additionally, nginx has `depends_on: backend: condition: service_healthy` — so when backend is rebuilt, Compose **stops nginx** during the transition. `restart: always` does NOT cover this (it's for crash recovery, not dependency transitions). A cron watchdog at `/home/minh/deployment/nginx-watchdog.sh` on the VM restarts nginx within 60 seconds if it's ever down.

## 6. Known Issues (2026-04-10)

- **AI Search broken in production** — backend needs real `GOOGLE_PROGRAMMABLE_SEARCH_API_KEY` (currently `placeholder` → 500 on agent tool call)
- **No automated tests** — no test files exist yet in `src/`. Adding Playwright E2E would benefit critical user flows.
- **`pnpm build` fails** due to pre-existing TypeScript errors — use `npx vite build` instead
- **VM has no pnpm on interactive PATH** — `pnpm` lives at `$HOME/.local/share/pnpm/pnpm`. Scripts must export `PATH` explicitly if invoking pnpm from SSH

## 7. Troubleshooting

### "My push to main didn't update production"

```bash
# Check if the trigger fired
gh run list -R Venera-AI/user-dashboard --workflow=trigger-deploy.yaml --limit 3

# Check if the downstream deploy ran
gh run list -R Venera-AI/api-hub-deployment --workflow=deploy.yaml --limit 5

# Check the live bundle hash
curl -s https://hub.venerian.space/ | grep -oE 'assets/index-[a-zA-Z0-9_-]+\.js'
```

If the `api-hub-deployment` deploy did NOT run, check `secrets.DEPLOY_PAT` permissions — it needs access to both repos.

### "Feature I just merged isn't showing up"

1. Confirm bundle hash changed (see above)
2. If hash changed but feature missing: hard refresh browser (CDN/service worker cache)
3. If hash unchanged: the deploy failed silently. Check logs with `gh run view <run-id> -R Venera-AI/api-hub-deployment --log`
