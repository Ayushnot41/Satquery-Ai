# BHUVISION // Complete REST API & OpenAPI Specification
### Defense-Grade Multimodal Remote Sensing Engine — Version 1.0.0
**Smart India Hackathon 2026 // Problem Statement SIH26167**  
**Team:** BANKAI | **Mentorship:** ISRO | **Lead Architect:** [@Ayushnot41](https://github.com/Ayushnot41)  

---

## 🌐 Interactive Documentation Access

* 📑 **[Open Live Interactive Swagger UI (In-Browser)](https://raw.githack.com/Ayushnot41/Satquery-Ai/main/docs/swagger.html)**
* 🖥️ **[Open Localhost Swagger UI (Requires running backend)](http://127.0.0.1:8000/docs)**
* 📦 **[Download Raw OpenAPI 3.1 JSON Schema](openapi.json)**

---

## 🛰️ Complete REST API Endpoint Directory

| Method | Endpoint Route | Summary & Purpose | Security Clearance |
| :---: | :--- | :--- | :---: |
| `GET` | `/` | Get Root | Public |
| `POST` | `/api/auth/google` | Login With Google | Level 1-4 (Auth) |
| `POST` | `/api/auth/login` | Login With Email | Level 1-4 (Auth) |
| `POST` | `/api/auth/logout` | Logout | Level 1-4 (Auth) |
| `GET` | `/api/auth/me` | Get Current User Profile | Level 1-4 (Auth) |
| `POST` | `/api/auth/otp/send` | Send Phone Otp | Level 1-4 (Auth) |
| `POST` | `/api/auth/otp/verify` | Verify Phone Otp | Level 1-4 (Auth) |
| `POST` | `/api/auth/register` | Register With Email | Level 1-4 (Auth) |
| `GET` | `/api/download/deployment-manual` | Download Deployment Manual Pdf | Public |
| `GET` | `/api/futuristic/debate` | Get Agent Debate Protocol | Public |
| `GET` | `/api/futuristic/edge-inference/telemetry` | Get On Orbit Edge Telemetry | Public |
| `GET` | `/api/futuristic/insar/subsidence` | Get Insar Subsidence Profile | Level 3 (Secret) |
| `GET` | `/api/futuristic/sam-geo/segment` | Segment Anything Geospatial | Public |
| `GET` | `/api/health` | Get Health | Public |
| `GET` | `/api/imagery` | List All Imagery | Public |
| `POST` | `/api/imagery/upload` | Upload Image | Public |
| `GET` | `/api/imagery/{image_id}` | Get Imagery Metadata | Public |
| `GET` | `/api/investigate` | List Investigations | Level 1-4 (Public/Secret) |
| `POST` | `/api/investigate` | Start Investigation | Level 1-4 (Public/Secret) |
| `POST` | `/api/investigate/measure/area` | Measure Polygon Area | Level 2 (Confidential) |
| `GET` | `/api/investigate/spectral/analyze` | Analyze Spectral Index | Level 2 (Confidential) |
| `GET` | `/api/investigate/{investigation_id}` | Get Investigation | Level 1-4 (Public/Secret) |
| `GET` | `/api/investigate/{investigation_id}/geojson` | Export Investigation Geojson | Level 1-4 (Public/Secret) |
| `GET` | `/api/locations/hotspots` | Get Curated Hotspots | Public |
| `GET` | `/api/locations/providers` | Get Satellite Providers | Public |
| `GET` | `/api/locations/search` | Search Locations | Public |
| `GET` | `/api/nasa-tile` | Proxy Nasa Gibs Tile | Public |
| `GET` | `/api/nasa-tile/layers` | Get Nasa Gibs Layers | Public |
| `GET` | `/api/scenarios` | List Scenarios | Public |
| `GET` | `/api/scenarios/{scenario_id}` | Get Scenario | Public |
| `POST` | `/api/traffic/evacuation-corridor` | Calculate Evacuation Corridor | Level 3 (Secret) |
| `GET` | `/api/traffic/flow` | Get Traffic Flow | Level 3 (Secret) |
| `GET` | `/app` | Get Interactive App | Public |
| `HEAD` | `/app` | Get Interactive App | Public |
| `GET` | `/docs/deployment-manual.pdf` | Download Deployment Manual Pdf | Public |
| `GET` | `/manifest.json` | Get Manifest | Public |
| `GET` | `/preview` | Get Interactive App | Public |
| `HEAD` | `/preview` | Get Interactive App | Public |

---

## 🔑 Core API Endpoints Breakdown

### 1. Spatial Investigation Pipeline (`POST /api/investigate/pipeline`)
Triggers the full 9-agent autonomous Graph-of-Thought (GoT) spatial investigation council.
* **Request Body:**
  ```json
  {
    "query": "Detect flood water and building inundation in Kaziranga",
    "lat": 26.5775,
    "lon": 93.1711,
    "zoom": 13,
    "sensor_preference": "auto"
  }
  ```
* **Response:** Full 9-agent dossier with SAR backscatter, optical features, polygon boundaries, and confidence score.

### 2. Multispectral Radiometric Analysis (`POST /api/investigate/spectral/analyze`)
Computes instant surface indices (NDVI, NDWI, NDBI) over multi-band optical imagery.
* **Query Parameters:** `sensor` (Sentinel-2 / Landsat-8 / Cartosat-3)
* **Output:** Normalized index values with vegetation density and flood water delineation.

### 3. WGS-84 Geodesic Polygon Area Measurement (`POST /api/investigate/measure/area`)
Computes exact surface area on the WGS-84 reference ellipsoid for user-drawn boundaries.
* **Outputs:** `hectares` ($Ha$), `square_km` ($km^2$), `acres` ($ac$), `perimeter_km` ($km$).

### 4. RFC 7946 Standard GeoJSON Export (`GET /api/investigate/{id}/geojson`)
Exports complete investigation dossier as standard GeoJSON FeatureCollection importable into ISRO Bhuvan, QGIS, and Google Earth.

### 5. Multi-Factor Authentication Suite (`/api/auth/*`)
* `POST /api/auth/register` — Register email, password, and requested security clearance.
* `POST /api/auth/login` — Authenticate and receive signed cryptographic session token.
* `POST /api/auth/google` — Google OAuth 2.0 PKCE authentication exchange.
* `POST /api/auth/otp/send` — Dispatches 6-digit SMS verification code to operator's mobile.
* `POST /api/auth/otp/verify` — Validates SMS PIN and activates Level 3/4 tactical clearance.
* `GET /api/auth/me` — Retrieve active operator profile and clearance badge.
* `POST /api/auth/logout` — Revokes active session token.

---

## 🩺 Health & Diagnostics
* `GET /api/health` — Checks status of all 9 agents, SAR engine, map proxies, and database.
* `GET /api/scenarios` — Lists preloaded high-priority national emergency scenarios.
* `GET /api/traffic-vector` — Fetches real-time arterial road traffic velocities.
