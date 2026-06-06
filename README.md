# MindClassify — Mental Health NLP Classification System

MindClassify is an automatic mental health classification system that uses Natural Language Processing (NLP) to categorise social media text into one of seven mental health states. Users write diary entries in a web or mobile app; the text is classified by a trained ML model, saved to a database, and then Claude writes a short empathetic reply as a poetic diary companion.

---

## How It Works

```
User writes a diary entry
         │
         ▼
  [React / React Native UI]
         │  POST /api/analyze
         ▼
  [Express Backend :5000]
         │  POST /predict
         ▼
  [Flask Model Service :5001]
         │
         ├─── If a trained model exists → runs BERT / MentalBERT inference
         │
         └─── If no model found        → demo mode (keyword heuristics)
         │
         ▼
  Returns { label, confidence, probabilities }
         │
         ▼
  [Express Backend]  saves entry to MongoDB
         │
         ▼
  [UI shows classification result]
         │  POST /api/companion  (non-blocking, fires after result shown)
         ▼
  [Express Backend → Claude claude-sonnet-4-5]
         │
         ▼
  Claude writes a short poetic diary response based on the label
         │
         ▼
  [CompanionCard appears below the result]
```

### Step-by-step

1. **Write** — the user types a diary entry in the web app (`localhost:3000`) or mobile app.
2. **Classify** — the backend forwards the text to the Flask model service, which returns a label (e.g. `Anxiety`), a confidence score, and per-class probabilities.
3. **Save** — the entry, label, and confidence are stored in MongoDB so the user can review their history.
4. **Reply** — after the classification card appears, a second request is sent to `/api/companion`. Claude reads the entry and the label, then writes a warm 3–4 sentence diary reply. For suicidal content, the reply always includes the 988 Lifeline number.

---

## Demo Mode vs Real Model

### Demo Mode (default until you train)

When the Flask service starts and finds **no trained model** in `model_service/saved_models/`, it falls back to **demo mode**:

- Classification is done with simple keyword matching heuristics (e.g. "hopeless" → Depression, "panic" → Anxiety).
- The `/health` endpoint returns `"model_type": "demo"`.
- Confidence scores are approximate and not meaningful.
- The UI and companion feature still work normally — demo mode exists so you can explore the interface before training.

You can confirm which mode is active:
```bash
curl http://localhost:5001/health
# { "status": "ok", "model_type": "demo" }        ← no model trained
# { "status": "ok", "model_type": "transformer" }  ← BERT/MentalBERT loaded
# { "status": "ok", "model_type": "baseline" }     ← TF-IDF + LR loaded
```

### Loading a Trained Model

The model service auto-detects the best available model in this priority order:

| Priority | What it looks for | Model type |
|----------|------------------|------------|
| 1st | `model_service/saved_models/*_best/` (transformer folder) | `transformer` |
| 2nd | `model_service/saved_models/baseline_lr.pkl` | `baseline` |
| 3rd | Nothing found | `demo` |

`model_service/saved_models/` is **bind-mounted** into the Docker container, so any model file you place there is immediately visible without rebuilding. After training, just restart:

```bash
# Option A — train inside the running container (files write straight to the bind mount)
docker compose exec model_service bash
python baseline_model.py --data_path data/mental_health.csv --fast  # quick test
exit
docker compose restart model_service

# Option B — train locally, then restart (files land in model_service/saved_models/ automatically)
cd model_service
python baseline_model.py --data_path data/mental_health.csv
cd ..
docker compose restart model_service

# Verify the model loaded
curl http://localhost:5001/health
# {"status":"ok","model_type":"baseline",...}   ← real model
# {"status":"ok","model_type":"demo",...}         ← still no model found
```

Trained file locations:
- Baseline: `model_service/saved_models/baseline_lr.pkl`
- BERT: `model_service/saved_models/bert-base-uncased_best/`
- MentalBERT: `model_service/saved_models/mental_mental-bert-base-uncased_best/`

---

## Classes

| ID | Class | Description |
|----|-------|-------------|
| 0 | Normal | No mental health concerns detected |
| 1 | Depression | Persistent low mood, hopelessness |
| 2 | Suicidal | Suicidal ideation or self-harm references |
| 3 | Anxiety | Excessive worry, panic |
| 4 | Stress | Situational pressure, overwhelm |
| 5 | Bipolar Disorder | Mood cycling, mania/depression episodes |
| 6 | Personality Disorder | Identity, relationship, and emotional instability |

---

## Architecture

```
mindclassify/
├── frontend/          React 18 + TailwindCSS (nginx, port 3000)
├── backend/           Node.js / Express + MongoDB (port 5000)
├── model_service/     Python NLP + Flask (port 5001) + Gradio (port 7860)
│   └── data/          ← place mental_health.csv here
├── mobile/            React Native (Expo) mobile app
├── docker-compose.yml
└── README.md
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Web Frontend | React 18, TailwindCSS, Recharts, Axios |
| Mobile | React Native, Expo SDK 52, Expo Router 4, TypeScript |
| Backend | Node.js, Express, MongoDB, Mongoose, @anthropic-ai/sdk |
| Model Service | Python, PyTorch, HuggingFace Transformers, Flask, Gradio |
| Models | MentalBERT, BERT, TF-IDF + Logistic Regression |
| Companion | Claude claude-sonnet-4-5 (Anthropic API) |
| Infrastructure | Docker, Docker Compose, nginx |

---

## Quick Start — Docker (recommended)

### Prerequisites

- [Docker Desktop](https://docs.docker.com/get-docker/) installed and running

### 1. Add the dataset

Download from Kaggle and place at:

```
model_service/data/mental_health.csv
```

> Dataset: [Sentiment Analysis for Mental Health](https://www.kaggle.com/datasets/suchintikasarkar/sentiment-analysis-for-mental-health)
> Required columns: `statement` (text) and `status` (label string).

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in your Anthropic key (leave everything else as-is):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mindclassify   # docker-compose overrides this automatically
MODEL_SERVICE_URL=http://localhost:5001             # docker-compose overrides this automatically
ANTHROPIC_API_KEY=sk-ant-YOUR_REAL_KEY_HERE        # paste your key from console.anthropic.com
```

Docker Compose reads `backend/.env` and injects `ANTHROPIC_API_KEY` into the backend container. The networking values (MONGO_URI, MODEL_SERVICE_URL) are overridden by docker-compose.yml automatically — you don't need to change them.

Without `ANTHROPIC_API_KEY`, the companion card and Chat page won't work, but classification and diary saving work normally.

### 3. Start all services

```bash
docker compose up --build
```

| Service | URL | Description |
|---------|-----|-------------|
| Web App | http://localhost:3000 | React diary UI |
| Backend API | http://localhost:5000 | Express REST API |
| Model Service | http://localhost:5001 | Flask inference API |
| Gradio Demo | http://localhost:7860 | Interactive standalone NLP demo |
| MongoDB | localhost:27017 | Diary entry storage |

> On first start, the model service runs in **demo mode** because no model has been trained yet. The UI is fully usable. See [Demo Mode vs Real Model](#demo-mode-vs-real-model) above.

### 4. Train a model (to replace demo mode)

Open a shell into the running model service container and run training:

```bash
docker compose exec model_service bash

# Inside the container:

# Step 1 — TF-IDF + Logistic Regression baseline (~2 min)
python baseline_model.py --data_path data/mental_health.csv

# Step 2 — BERT fine-tuning (~25 hrs CPU / ~1.5 hrs GPU)
python transformer_trainer.py \
  --model_name bert-base-uncased \
  --data_path data/mental_health.csv

# Step 3 — MentalBERT fine-tuning (recommended, ~same time as Step 2)
python transformer_trainer.py \
  --model_name mental/mental-bert-base-uncased \
  --data_path data/mental_health.csv

# Step 4 — Zero-shot LLM comparison (requires API keys in env)
python llm_classifier.py --compare_all
```

After training, restart the model service to load the new checkpoint:

```bash
# In a new terminal (outside the container)
docker compose restart model_service

# Verify it loaded the real model
curl http://localhost:5001/health
```

### 5. Stop

```bash
docker compose down          # stop, keep MongoDB data
docker compose down -v       # stop and delete all data
```

---

## Training — Fast Mode (for testing)

Full training takes hours on CPU. Use `--fast` to train on a small sample in under 20 minutes:

```bash
# Baseline fast (~1 min)
python baseline_model.py --data_path data/mental_health.csv --fast

# Transformer fast (~10–15 min CPU)
python transformer_trainer.py \
  --model_name bert-base-uncased \
  --data_path data/mental_health.csv \
  --fast
```

Fast mode uses 2,000 training samples, sequence length 64, and 2 epochs. Results are not representative — use only to verify the pipeline runs end-to-end.

---

## Training Pipeline (4 Steps)

### Step 1 — Baseline: TF-IDF + Logistic Regression

```bash
python baseline_model.py --data_path data/mental_health.csv
```

- TF-IDF with unigram + bigram features (50,000 max, sublinear TF scaling)
- Logistic Regression with `class_weight='balanced'` for class imbalance
- 5-fold cross-validation scored on Macro F1
- Outputs: `saved_models/baseline_lr.pkl`, confusion matrix, per-class F1 chart

### Step 2 — Main Model: BERT fine-tuning

```bash
python transformer_trainer.py \
  --model_name bert-base-uncased \
  --data_path data/mental_health.csv
```

- AdamW optimizer, lr=2e-5, 3 epochs, max sequence length 512
- Weighted cross-entropy loss (class weights from `compute_class_weight('balanced')`)
- Linear warmup for 10% of steps, gradient clipping at 1.0
- Early stopping on Macro F1 with patience=3
- Outputs: `saved_models/checkpoint/`, training history, confusion matrix

### Step 3 — MentalBERT comparison

```bash
python transformer_trainer.py \
  --model_name mental/mental-bert-base-uncased \
  --data_path data/mental_health.csv
```

Same setup as Step 2 but uses MentalBERT, pre-trained on mental health corpora. Expected to outperform BERT on this domain.

### Step 4 — Zero-shot LLM comparison (optional)

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export OPENAI_API_KEY=sk-...
export GROQ_API_KEY=gsk-...

python llm_classifier.py --compare_all
```

Evaluates Claude, GPT, and Llama in zero-shot mode on 350 balanced test samples (50 per class). Reports Macro F1 and Suicidal Recall for each provider. No training required.

### Evaluation Metrics

| Metric | Why it matters |
|--------|---------------|
| **Macro F1** | Primary metric — treats all 7 classes equally regardless of size |
| **Suicidal Recall** | Safety-critical — how many truly suicidal posts are caught |
| **Confusion Matrix** | Shows which classes get confused with each other |
| **Qualitative Analysis** | Inspects up to 20 missed suicidal cases (false negatives) |

---

## Expected Model Performance

| Model | Macro F1 | Suicidal Recall |
|-------|----------|----------------|
| TF-IDF + Logistic Regression | ~0.68 | ~0.72 |
| BERT fine-tuned | ~0.86 | ~0.88 |
| MentalBERT fine-tuned | ~0.88 | ~0.90 |
| Claude (zero-shot) | ~0.65 | ~0.80 |

---

## Mobile App

The `mobile/` directory contains a React Native (Expo) app that mirrors the web UI.

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with [Expo Go](https://expo.dev/client) on your phone, or press `i` for iOS simulator / `a` for Android emulator.

**Important:** The mobile app connects to your backend at the IP address set in `mobile/constants.ts`. Change `API_BASE_URL` to your machine's local IP (e.g. `http://192.168.1.10:5000`) — `localhost` does not work on a physical device.

---

## Diary Companion Feature

After each diary entry is classified, Claude writes a short empathetic response as if it were the diary writing back. The response is warm, poetic, and never clinical. For entries classified as Suicidal, it always includes the 988 Suicide & Crisis Lifeline.

**To enable:** add `ANTHROPIC_API_KEY` to `backend/.env`.

**If the key is missing or the API call fails:** the companion card simply does not appear. The classification and diary saving still work normally.

The companion call is **non-blocking** — the classification result is shown immediately, and the diary reply loads in the background underneath it.

---

## Local Development (without Docker)

### Model Service

```bash
cd model_service
pip install -r requirements.txt

python main.py          # Flask API on port 5001
python demo.py          # Gradio demo on port 7860
```

### Backend

```bash
cd backend
cp .env.example .env    # fill in MONGO_URI and ANTHROPIC_API_KEY
npm install
npm run dev             # port 5000
```

### Frontend

```bash
cd frontend
npm install
npm start               # port 3000
```

---

## API Reference

### Model Service — Flask (port 5001)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `GET` | `/health` | — | Health check; returns active model type |
| `POST` | `/predict` | `{"text": "..."}` | Classify a single text |
| `POST` | `/batch_predict` | `{"texts": ["..."]}` | Classify up to 100 texts |

**`/health` response examples:**
```json
{ "status": "ok", "model_type": "demo" }
{ "status": "ok", "model_type": "baseline" }
{ "status": "ok", "model_type": "transformer" }
```

**`/predict` response:**
```json
{
  "label": "Anxiety",
  "label_id": 3,
  "confidence": 0.847,
  "probabilities": {
    "Normal": 0.030, "Depression": 0.080, "Suicidal": 0.010,
    "Anxiety": 0.847, "Stress": 0.020, "Bipolar": 0.010,
    "Personality Disorder": 0.003
  }
}
```

### Backend — Express (port 5000)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/entries` | List diary entries (paginated) |
| `POST` | `/api/entries` | Create a new diary entry |
| `GET` | `/api/entries/:id` | Get a single entry |
| `PUT` | `/api/entries/:id` | Update an entry |
| `DELETE` | `/api/entries/:id` | Delete an entry |
| `POST` | `/api/analyze` | Classify text (proxies to model service) |
| `POST` | `/api/analyze/batch` | Batch classify |
| `POST` | `/api/companion` | Get Claude diary companion response |

**`/api/companion` request / response:**
```json
// Request
{ "text": "I feel completely hopeless", "label": "Depression" }

// Response
{ "response": "Dear diary, I hear the weight you are carrying today...", "label": "Depression" }

// Response when ANTHROPIC_API_KEY not set
{ "response": null, "label": "Depression", "fallback": true }
```

---

## Project Structure

```
mindclassify/
├── docker-compose.yml
├── README.md
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── components/
│       │   ├── JournalInput.jsx
│       │   ├── ResultCard.jsx
│       │   ├── CompanionCard.jsx    ← diary companion UI
│       │   ├── HistoryList.jsx
│       │   └── EntryCard.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   └── History.jsx
│       └── services/api.js
│
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── routes/
│       │   ├── entries.js
│       │   ├── analyze.js
│       │   └── companion.js         ← companion route
│       ├── controllers/
│       │   ├── entriesController.js
│       │   ├── analyzeController.js
│       │   └── companionController.js  ← Claude API call
│       └── models/Entry.js
│
├── model_service/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── data/                        ← mental_health.csv goes here
│   ├── saved_models/                ← checkpoints written here
│   ├── plots/                       ← analysis charts written here
│   ├── data_preprocessing.py
│   ├── baseline_model.py            ← Step 1
│   ├── transformer_trainer.py       ← Steps 2 & 3
│   ├── llm_classifier.py            ← Step 4
│   ├── analysis.py
│   ├── main.py                      ← Flask API
│   └── demo.py                      ← Gradio demo
│
└── mobile/
    ├── app/(tabs)/
    │   ├── index.tsx                ← Home screen
    │   └── history.tsx              ← History screen
    ├── components/
    │   ├── JournalInput.tsx
    │   ├── ResultCard.tsx
    │   └── CompanionCard.tsx        ← diary companion UI
    ├── services/api.ts
    └── constants.ts                 ← set API_BASE_URL here
```

---

## Disclaimer

MindClassify is a research prototype built for academic purposes. It is **not** a clinical diagnostic tool and must not be used as a substitute for professional mental health advice. If you or someone you know is in crisis, please contact a qualified mental health professional or call the **988 Suicide & Crisis Lifeline** (call or text 988).
