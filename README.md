# Pulseboard Cardiac AI - Real-Time Risk & Explainability

A real-time cardiac disease risk prediction dashboard powered by Kafka streaming, the UCI Cleveland Random Forest model, and individual patient SHAP and LIME explainability.

---

## 🚀 How to Run Locally

You can download or export this codebase directly from Google AI Studio and run it on any machine (macOS, Windows, Linux).

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js) or **yarn** / **pnpm** / **bun**

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
```
The optimized production output will be generated in the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

---

## 📦 Exporting Options

1. **Download as ZIP / Export to GitHub**:
   - In Google AI Studio Build, use the **Export** / **Download ZIP** or **Push to GitHub** option in the top right menu.
2. **Deploy Anywhere**:
   - The app is a standard Vite + React + TypeScript Single Page Application (SPA).
   - It can be deployed with zero configuration on:
     - **Vercel** (`npm run build`, output directory `dist`)
     - **Netlify** (`npm run build`, publish directory `dist`)
     - **Cloudflare Pages** (`npm run build`, output directory `dist`)
     - **Docker / Nginx** / any static web server

---

## 🩺 Application Features
- **Holdout Test Evaluation**: Real-time validation metrics on 184 test records from the UCI Cleveland dataset.
- **AI Explainability**: Dual SHAP feature attribution waterfall and LIME local decision rules for every patient.
- **Interpretable Clinical Reports**: Generates printable physician reports detailing risk drivers, vitals, and findings.
- **IoT Patient Vital Stream**: Kafka topic partition stream monitor with live vitals and telemetry event logs.
- **Live Patient Monitoring**: Real-time multi-patient status, sorting, and vital sign tracking.
