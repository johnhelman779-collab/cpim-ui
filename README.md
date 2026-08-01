# cpim-ui

Small React dashboard for the CPIM Computer Integration Management system.

## Role

Talks only to the API gateway (`cpim-api-api`). Provides login, device list/detail (simulated tag poll/write), and exception acknowledgement.

## Prerequisites

Gateway and downstream services running (see workspace root README).

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Demo login: `admin` / `admin`.

## Environment

- `VITE_API_BASE_URL` (default `http://localhost:3000`)
