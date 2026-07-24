# Alcohol Label Scanner & Compliance Engine

A high-performance Full-Stack prototype designed to automate regulatory compliance for federal TTB alcohol labeling standards.

## 🚀 Live Demo
[Public Prototype Link](https://scanner-demo.samweimer.com)

---

## 🛠 Technical Architecture

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS.
- **Backend:** Next.js API Routes (Serverless).
- **AI Core:** Gemini 3.1 Flash Lite for ultra-fast, high-accuracy OCR and text extraction.
- **Database:** Firebase Firestore for persistent scan history and manual overrides.
- **Image Processing:** Client-side HTML Canvas compression (converts multi-MB photos to lightweight JPEGs in ~50ms).

---

## ✅ Core Requirements Fulfillment

### 1. Automated Data Matching Engine
The system extracts and validates:
- **Brand Name:** Fuzzy matching with similarity scores.
- **Class/Type:** Taxonomy-based keyword detection.
- **ABV:** Pattern-matching with percentage tolerance checks.
- **Net Contents:** Volume declaration detection.
- **Producer Statement:** Detection of operational keywords (e.g., "Distilled By").

### 2. Strict Government Warning Verification
Performs word-for-word validation of the mandated federal warning statement. 
- **Implementation:** Normalizes whitespace and casing to verify the presence of the "GOVERNMENT WARNING:" header and two mandatory sub-points.

### 3. Performance Benchmark (Sub-5-Second)
- **Result:** Average end-to-end processing (Upload -> OCR -> Rules -> UI) is **~3.0 seconds**.
- **Optimization:** Achieved via client-side compression and leveraging the low-latency Gemini 3.1 Flash Lite model.

### 4. Resilient Bulk Uploads
Allows processing of up to 10 labels simultaneously with robust failure isolation.
- **Implementation:** Sequential throttled processing (1.2s delay) with real-time status tracking and an in-memory server-side rate limiter to prevent API quota breaches.

### 5. Ultra-Simple UI
Designed for compliance agents with zero learning curve. Features:
- Native camera access for mobile users.
- Clear "Pass/Fail/Warning" status indicators.
- One-click expandable results.

### 6. Reviewer Workbench
Provides a detailed breakdown of every rule check, showing the specific evidence detected on the label alongside the final determination.

---

## 🌟 Bonus Features
- **Fuzzy Matching:** Integrated `Fuse.js` for intelligent handling of casing and minor text variations.
- **Manual Overrides:** Fully functional editing mode allows reviewers to correct OCR misreads or toggle compliance statuses, which persist back to the database.
- **Image Resilience:** The multimodal nature of Gemini 3.1 Flash Lite handles glare, odd angles, and stylized fonts far better than traditional OCR.
- **Concurrency Control:** A custom in-memory semaphore in the API layer manages request volume and protects upstream AI services.

---

## ⚖️ Trade-offs & Assumptions

1. **Async Persistence:** To achieve the fastest possible response, the scan is saved to the database asynchronously. The UI uses "eventual consistency" logic, where a refresh might be needed to see history updates.
2. **No Image Storage:** I explicitly chose **not** to store original images in Firestore/GCS to minimize cost and maximize processing speed. I store only the extracted text data.
3. **Local Comparison:** For this prototype, the system compares detected data against itself or defaults. In a production environment, this would be linked to a COLA application database.
4. **Environment Variables:** Firebase and Google AI keys are required in a `.env.local` file (see `package.json` for structure).
5. **Always-On Container (Cold Start Prevention):** For this demo, I have configured the Cloud Run service with `min-instances: 1`. This ensures that the demo experience is never delayed by serverless "cold starts," providing sub-second initial responsiveness for the first interaction.

---

## 📦 To load in your local environment:

0. **Change directory:**
   ```bash
   cd ./alcohol-label-scanner
   ```

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Create a `.env.local` with your `GOOGLE_GENERATIVE_AI_API_KEY` and Firebase credentials.

3. **Run Development:**
   ```bash
   npm run dev
   ```
