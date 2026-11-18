# MMAM: Multimodal Departure Monitor

[![Tests](https://github.com/JohannesHenz/mmam-public/actions/workflows/test.yml/badge.svg)](https://github.com/JohannesHenz/mmam-public/actions/workflows/test.yml)

A web-based departure board for Vienna that combines **Wiener Linien** (subway, tram, bus) and **ÖBB** (Austrian Federal Railways) departures on an interactive map, together with live service disruptions and a short-term weather forecast.

Built as a student project at FH Technikum Wien.

## Features

- **Interactive map** (Leaflet) centered on the user's location, with nearby ÖBB stations shown as pins
- **ÖBB departures** for any station, with autocomplete station search
- **Wiener Linien realtime departures** for the stop matching or nearest to the selected station
- **Service disruptions** (outages, elevator status) filtered to the lines that serve the selected station
- **6-hour weather forecast** for the current location (GeoSphere Austria)
- **Persistent map settings** (position and zoom) stored in PostgreSQL

## Tech stack

| Layer    | Technology                                                    |
| -------- | ------------------------------------------------------------- |
| Backend  | Node.js, Express, EJS templates                               |
| Database | PostgreSQL 16 (`pg`)                                          |
| Frontend | jQuery, Bootstrap 5, Leaflet                                  |
| Tooling  | Docker Compose, nodemon, Jest + Supertest, GitHub Actions     |
| Data     | Wiener Linien OGD realtime API, ÖBB HAFAS, GeoSphere Austria  |

## Architecture

```
Browser (jQuery + Leaflet)
        │  HTTPS
        ▼
Express server (server.js)
  ├── /               → renders the single-page UI (views/*.ejs)
  ├── /stop-info      → Wiener Linien departures & connected lines
  ├── /journeys       → ÖBB station search, cached into Postgres
  ├── /disruptions    → Wiener Linien traffic info
  ├── /weather        → GeoSphere forecast for the stored location
  ├── /location       → stores the client's current location
  └── /settings       → read/update map settings (validated)
        │
        ├── PostgreSQL: stops (haltepunkte), ÖBB stations, settings
        └── External APIs: Wiener Linien, ÖBB, GeoSphere
```

On first start, the server downloads the Wiener Linien stop list (OGD CSV) and imports it into Postgres. This lets ÖBB stations be matched to nearby Wiener Linien stops with a geometric distance query.

## Getting started

### Prerequisites

- Docker and Docker Compose
- `openssl` (for the local development certificate)
- Node.js 18+ (only needed to run without Docker or to run the tests)

### Run with Docker (recommended)

```bash
npm run certs            # or: node scripts/generate-certs.js (creates ./certs/*.pem)
docker compose up --build
```

Then open <https://localhost> and accept the self-signed certificate.

### Run locally

```bash
npm install
npm run certs
cp .env.example .env     # adjust PORT / DATABASE_URL if needed
npm run dev
```

You'll need a PostgreSQL instance initialized with [`docker/init.sql`](docker/init.sql). `docker/run.sh` (or `docker/run.ps1` on Windows) starts one in a container.

### Configuration

| Variable        | Default                         | Description                       |
| --------------- | ------------------------------- | --------------------------------- |
| `PORT`          | `443`                           | HTTPS port                        |
| `DATABASE_URL`  | `postgres://…@database/mmam`    | Postgres connection string        |
| `TLS_KEY_PATH`  | `./certs/key.pem`               | TLS private key                   |
| `TLS_CERT_PATH` | `./certs/cert.pem`              | TLS certificate                   |

## Tests

```bash
npm test
```

Unit tests cover settings validation, weather data conversion, and the location route.

## Project structure

```
├── server.js            # Express app & HTTPS server
├── routes/              # API routes (one file per feature)
├── database/            # Postgres client singleton with auto-reconnect
├── utils/               # Logger and shared location state
├── views/               # EJS templates
├── public/              # Frontend JS, CSS, images
├── docker/              # Postgres image & schema (init.sql)
├── wienerlinien/        # Wiener Linien open data & API docs
├── scripts/             # Dev tooling (certificate generation)
├── tests/               # Jest test suite
└── docs/                # Notes, data source links, usability test
```

## Data sources

- [Wiener Linien Open Government Data](https://www.data.gv.at/katalog/dataset/522d3045-0b37-48d0-b868-57c99726b1c4) (CC BY 4.0)
- [ÖBB Fahrplan](https://fahrplan.oebb.at/)
- [GeoSphere Austria Data Hub](https://dataset.api.hub.geosphere.at/)
