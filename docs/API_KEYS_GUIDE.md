# BHUVISION // Complete Location & Spatial API Keys Guide
### Step-by-Step Acquisition Manual for Judges, Evaluators & Developers
**Smart India Hackathon 2026 // Problem Statement SIH26167**  
**Team:** BANKAI | **Mentorship:** ISRO | **Lead:** [@Ayushnot41](https://github.com/Ayushnot41)

---

## 🧭 Zero-Key Architecture (Runs Out-of-the-Box)

> [!NOTE]
> **No API Keys Required to Run!**  
> BHUVISION is engineered with a **Zero-Key Architecture**. If you don't enter any API keys, the system automatically uses:
> - **ESRI World Imagery (0.3m GSD):** High-resolution global satellite imagery.
> - **NASA GIBS Public NRT:** Daily optical true-color scans of Earth.
> - **OpenStreetMap Nominatim:** Global geocoding search across cities and coordinates.
> - **Synthetic Aperture Radar (SAR) Engine:** Physics-based polarimetric processing.
>
> Configuring the **Three Map API Keys** below unlocks **Google Maps 3D Hybrid, MapTiler Terrain-RGB 3D Elevation, and Authenticated NASA Multi-Spectral Satellite Layers**.

---

## 1. Google Maps Platform (Satellite Hybrid, 3D Tilt & Live Traffic)

### What it Unlocks in BHUVISION:
- **Live Hybrid Satellite View:** Google sub-meter satellite composite with street labels and boundaries.
- **45° Oblique 3D Tilt:** Photorealistic perspective exploration.
- **Live Traffic Engine:** Arterial road speeds, congestion heatmaps, and evacuation chokepoint bypass routing.
- **Places Geocoding:** Auto-completing search for any landmark, street address, or village.

### Step-by-Step Guide:
1. Visit [Google Cloud Console](https://console.cloud.google.com/) and sign in.
2. Create project `BHUVISION-Earth-Intelligence`.
3. Enable **Maps JavaScript API**, **Places API**, and **Routes API**.
4. Create an API key under **Credentials** (starts with `AIzaSy...`).
5. Google provides **$200 free monthly credit**, covering thousands of live map loads.

---

## 2. MapTiler Cloud (Satellite Tiles & Terrain-RGB 3D Elevation)

### What it Unlocks in BHUVISION:
- **0.5m GSD Satellite Tiles:** Global high-resolution satellite basemap.
- **Terrain-RGB 3D Mesh:** True millimeter-scale elevation modeling for steep terrain, flood basins, and mountain passes.
- **TopoJSON Administrative Boundaries:** Clean vector boundaries overlaid on satellite rasters.
- **100% Free Tier:** 100,000 tile requests/month with **no credit card required**!

### Step-by-Step Guide:
1. Go to [https://cloud.maptiler.com/](https://cloud.maptiler.com/) and sign up for a free account.
2. Navigate to **"Keys"** at [https://cloud.maptiler.com/account/keys/](https://cloud.maptiler.com/account/keys/).
3. Copy your API Key or Key UUID.
4. Set `MAPTILER_API_KEY=your_key` in `backend/.env`.

---

## 3. NASA Earthdata Login (Authenticated GIBS Multi-Spectral WMTS)

### What it Unlocks in BHUVISION:
- **MODIS Terra TrueColor (Daily 250m):** Near-real-time global optical scans.
- **MODIS FalseColor (Bands 7-2-1):** Highlights flood water vs. bare soil and healthy vegetation.
- **VIIRS Night Lights (Day-Night Band):** Nighttime luminescence, blackout detection, and settlement density.
- **MODIS NDVI 8-Day Composite:** Vegetation health and agricultural drought tracking.
- **Aerosol Optical Depth (AOD):** Wildfire smoke, dust storms, and atmospheric optical depth.
- **Authenticated Proxy:** Backend injects `Authorization: Bearer <JWT_TOKEN>` to `/api/nasa-tile`.

### Step-by-Step Guide:
1. Register for free at [https://urs.earthdata.nasa.gov/users/new](https://urs.earthdata.nasa.gov/users/new).
2. Generate an Earthdata Login JWT Bearer token.
3. Set `NASA_EARTHDATA_TOKEN=eyJ...` in `backend/.env`.

---

## 4. OpenRouter Multi-Agent Gateway (9 Dedicated Models)

### What it Unlocks in BHUVISION:
- Connects all 9 agents to dedicated models (Gemini 2.5 Flash, DeepSeek-R1, Llama 3.3 70B, Qwen 2.5 72B, Mistral Small).
- Fallback chain: `OpenRouter` $\rightarrow$ `OmniRoute (:20128)` $\rightarrow$ `FreeLLMAPI (:3001)`.

### Step-by-Step Guide:
1. Sign up at [https://openrouter.ai/](https://openrouter.ai/).
2. Create an API key under **Keys** (`sk-or-v1-...`).
3. Set `OPENROUTER_API_KEY=sk-or-v1-...` in `backend/.env`.

---

## 5. Summary of API Limits & Features

| Service | Key Config Variable | Free Monthly Quota | Credit Card Required? | Role |
| :--- | :--- | :--- | :---: | :--- |
| **Google Maps Platform** | `GOOGLE_MAPS_API_KEY` | \$200 credit (~28,000 loads) | Yes | Hybrid 2D/3D + Traffic |
| **MapTiler Cloud** | `MAPTILER_API_KEY` | 100,000 requests / month | ❌ No | 3D Terrain-RGB + Satellite |
| **NASA Earthdata / GIBS** | `NASA_EARTHDATA_TOKEN` | Unlimited Free Public Access | ❌ No | Daily Passes + 5 Spectral Layers |
| **OpenRouter** | `OPENROUTER_API_KEY` | Pay-as-you-go + Free models | ❌ No | 9-Agent Dedicated LLM Council |
| **ESRI World Imagery** | Built-in | Unlimited Public Access | ❌ No | Out-of-the-box Basemap Fallback |
