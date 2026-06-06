"""
llm_classifier.py
-----------------
Step 4 — LLM Zero-shot Classification

Tests whether large language models can classify mental health social media
posts without any fine-tuning, and compares multiple LLMs head-to-head.

Research question: Can a general LLM match fine-tuned models out of the box?

Supported providers:
  claude   — Claude Sonnet  (Anthropic API)       requires ANTHROPIC_API_KEY
  openai   — GPT-4o-mini    (OpenAI API)           requires OPENAI_API_KEY
  groq     — Llama 3.3-70b  (Groq, free tier)      requires GROQ_API_KEY

Evaluation uses the SAME stratified test split as Steps 1-3 (seed=42),
with a configurable per-class sample cap to keep API costs reasonable.
Default: 50 samples per class = 350 total (~$0.05-0.10 per run).

Usage:
  python llm_classifier.py --provider claude --data_path data/mental_health.csv
  python llm_classifier.py --provider openai --data_path data/mental_health.csv
  python llm_classifier.py --provider groq   --data_path data/mental_health.csv
  python llm_classifier.py --compare_all     --data_path data/mental_health.csv

Environment variables (set in .env or shell):
  ANTHROPIC_API_KEY=sk-ant-...
  OPENAI_API_KEY=sk-...
  GROQ_API_KEY=gsk_...
"""

import os
import time
import json
import argparse
import numpy as np
import pandas as pd
from tqdm import tqdm
from sklearn.metrics import (
    accuracy_score, f1_score,
    precision_recall_fscore_support,
    classification_report,
)

from data_preprocessing import load_dataset, split_dataset, LABEL_NAMES

SAVE_DIR   = "saved_models"
PLOTS_DIR  = "plots"
os.makedirs(SAVE_DIR,  exist_ok=True)
os.makedirs(PLOTS_DIR, exist_ok=True)

SUICIDAL_IDX = LABEL_NAMES.index("Suicidal")

# ── System prompt shared across all providers ─────────────────────────────────

SYSTEM_PROMPT = """You are a mental health text classifier.

Classify the social media post into EXACTLY ONE of these 7 categories:

- Normal: Everyday thoughts, no mental health concern
- Depression: Persistent sadness, hopelessness, loss of interest
- Suicidal: Suicidal thoughts or ideation, explicit or implicit
- Anxiety: Excessive worry, panic, nervousness, fear
- Stress: Situational pressure, feeling overwhelmed
- Bipolar: Mood swings between mania/euphoria and depression
- Personality Disorder: Identity instability, emotional dysregulation

Rules:
1. Reply with ONLY the category name, exactly as written above.
2. No explanation, no punctuation, no extra words.
3. If genuinely ambiguous, pick the single most likely category."""

USER_TEMPLATE = "Classify this post:\n\n{text}"


# ── Provider implementations ──────────────────────────────────────────────────

def _call_claude(text: str, client, model: str) -> str:
    response = client.messages.create(
        model=model,
        max_tokens=16,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": USER_TEMPLATE.format(text=text[:2000])}],
    )
    return response.content[0].text.strip()


def _call_openai(text: str, client, model: str) -> str:
    response = client.chat.completions.create(
        model=model,
        max_tokens=16,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": USER_TEMPLATE.format(text=text[:2000])},
        ],
    )
    return response.choices[0].message.content.strip()


def _call_groq(text: str, client, model: str) -> str:
    # Groq uses OpenAI-compatible SDK
    response = client.chat.completions.create(
        model=model,
        max_tokens=16,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": USER_TEMPLATE.format(text=text[:2000])},
        ],
    )
    return response.choices[0].message.content.strip()


PROVIDER_CONFIG = {
    "claude": {
        "label":      "Claude Sonnet (zero-shot)",
        "model":      "claude-sonnet-4-5",
        "env_key":    "ANTHROPIC_API_KEY",
        "call_fn":    _call_claude,
        "init_fn":    lambda: __import__("anthropic").Anthropic(
                          api_key=os.environ["ANTHROPIC_API_KEY"]
                      ),
        "rate_limit": 0.5,   # seconds between calls
    },
    "openai": {
        "label":      "GPT-4o-mini (zero-shot)",
        "model":      "gpt-4o-mini",
        "env_key":    "OPENAI_API_KEY",
        "call_fn":    _call_openai,
        "init_fn":    lambda: __import__("openai").OpenAI(
                          api_key=os.environ["OPENAI_API_KEY"]
                      ),
        "rate_limit": 0.2,
    },
    "groq": {
        "label":      "Llama-3.3-70b via Groq (zero-shot)",
        "model":      "llama-3.3-70b-versatile",
        "env_key":    "GROQ_API_KEY",
        "call_fn":    _call_groq,
        "init_fn":    lambda: __import__("groq").Groq(
                          api_key=os.environ["GROQ_API_KEY"]
                      ),
        "rate_limit": 0.3,
    },
}


# ── Label parsing ─────────────────────────────────────────────────────────────

_LABEL_LOWER = {l.lower(): i for i, l in enumerate(LABEL_NAMES)}
# Extra aliases the LLM might produce
_ALIASES = {
    "bipolar disorder": LABEL_NAMES.index("Bipolar"),
    "suicidal ideation": LABEL_NAMES.index("Suicidal"),
    "bpd": LABEL_NAMES.index("Personality Disorder"),
    "ptsd": LABEL_NAMES.index("Anxiety"),
}

def parse_label(raw: str) -> int:
    """Map raw LLM output to a label ID. Returns -1 if unparseable."""
    cleaned = raw.strip().lower().rstrip(".")
    if cleaned in _LABEL_LOWER:
        return _LABEL_LOWER[cleaned]
    if cleaned in _ALIASES:
        return _ALIASES[cleaned]
    # Partial match — take the first label that appears in the response
    for label, idx in _LABEL_LOWER.items():
        if label in cleaned:
            return idx
    return -1   # failed to parse


# ── Evaluation ────────────────────────────────────────────────────────────────

def build_eval_subset(test_df: pd.DataFrame, samples_per_class: int, seed: int = 42) -> pd.DataFrame:
    """Stratified subsample of the test set — keeps costs manageable."""
    parts = []
    for label_id in range(len(LABEL_NAMES)):
        cls_df = test_df[test_df["label_id"] == label_id]
        n = min(samples_per_class, len(cls_df))
        parts.append(cls_df.sample(n, random_state=seed))
    subset = pd.concat(parts).sample(frac=1, random_state=seed).reset_index(drop=True)
    print(f"Evaluation subset: {len(subset)} samples "
          f"(up to {samples_per_class} per class)")
    return subset


def run_zero_shot(
    provider: str,
    test_df: pd.DataFrame,
    samples_per_class: int = 50,
    seed: int = 42,
    max_retries: int = 3,
) -> dict:
    """
    Run zero-shot classification for one provider on the eval subset.
    Returns a results dict compatible with analysis.run_full_analysis().
    """
    cfg = PROVIDER_CONFIG[provider]

    # Check API key
    if cfg["env_key"] not in os.environ or not os.environ[cfg["env_key"]]:
        raise EnvironmentError(
            f"Missing environment variable {cfg['env_key']}. "
            f"Set it before running: set {cfg['env_key']}=your_key_here"
        )

    client = cfg["init_fn"]()
    call_fn = cfg["call_fn"]
    model   = cfg["model"]
    label   = cfg["label"]
    delay   = cfg["rate_limit"]

    subset = build_eval_subset(test_df, samples_per_class, seed)
    texts  = subset["raw_text_original"].tolist()
    y_true = subset["label_id"].tolist()

    y_pred     = []
    failed     = 0
    cost_est   = 0.0

    print(f"\n{'='*60}")
    print(f"Step 4 — Zero-shot: {label}")
    print(f"{'='*60}")

    for i, text in enumerate(tqdm(texts, desc=f"  {provider}")):
        raw_response = None
        for attempt in range(max_retries):
            try:
                raw_response = call_fn(str(text)[:2000], client, model)
                break
            except Exception as e:
                wait = 2 ** attempt
                print(f"\n  Retry {attempt+1}/{max_retries} after error: {e} (wait {wait}s)")
                time.sleep(wait)

        if raw_response is None:
            pred_id = -1
            failed += 1
        else:
            pred_id = parse_label(raw_response)
            if pred_id == -1:
                failed += 1
                # Default to Normal if unparseable (conservative)
                pred_id = LABEL_NAMES.index("Normal")

        y_pred.append(pred_id)
        cost_est += len(str(text)) / 4 * 0.000001   # rough token estimate
        time.sleep(delay)

    # ── Metrics ───────────────────────────────────────────────────────────────
    acc      = accuracy_score(y_true, y_pred)
    f1_macro = f1_score(y_true, y_pred, average="macro", zero_division=0)
    _, recall_per, _, support_per = precision_recall_fscore_support(
        y_true, y_pred, labels=list(range(len(LABEL_NAMES))), zero_division=0
    )
    suicidal_recall  = recall_per[SUICIDAL_IDX]
    suicidal_support = int(support_per[SUICIDAL_IDX])
    suicidal_fn      = suicidal_support - int(round(suicidal_recall * suicidal_support))

    print(f"\nTest Macro F1      : {f1_macro:.4f}  ← primary metric")
    print(f"Test Accuracy      : {acc:.4f}")
    print(f"Suicidal Recall    : {suicidal_recall:.4f}  ← key safety metric")
    print(f"  (missed {suicidal_fn} of {suicidal_support} suicidal posts)")
    print(f"Parse failures     : {failed}/{len(texts)}")
    print(f"\n{classification_report(y_true, y_pred, target_names=LABEL_NAMES, zero_division=0)}")

    results = {
        "label":            label,
        "provider":         provider,
        "accuracy":         acc,
        "f1_macro":         f1_macro,
        "suicidal_recall":  suicidal_recall,
        "preds":            y_pred,
        "true":             y_true,
        "test_df":          subset,
        "failed_parses":    failed,
        "samples_evaluated": len(texts),
    }

    # Save to JSON
    safe = label.lower().replace(" ", "_").replace("(", "").replace(")", "").replace("-", "_")
    save_path = os.path.join(SAVE_DIR, f"llm_{provider}_results.json")
    serialisable = {k: v for k, v in results.items()
                    if k not in ("test_df",)}
    with open(save_path, "w") as f:
        json.dump(serialisable, f, indent=2)
    print(f"Results saved → {save_path}")

    return results


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Step 4 — LLM zero-shot mental health classification"
    )
    parser.add_argument("--data_path", default="data/mental_health.csv")
    parser.add_argument(
        "--provider",
        choices=list(PROVIDER_CONFIG.keys()),
        default="claude",
        help="Which LLM provider to use",
    )
    parser.add_argument(
        "--compare_all",
        action="store_true",
        help="Run all providers and produce a comparison (requires all API keys)",
    )
    parser.add_argument(
        "--samples_per_class", type=int, default=50,
        help="Number of test samples per class (default 50 → 350 total)",
    )
    args = parser.parse_args()

    # Load the same test split used in Steps 1-3
    df = load_dataset(args.data_path)
    _, _, test_df = split_dataset(df)

    providers = list(PROVIDER_CONFIG.keys()) if args.compare_all else [args.provider]
    all_results = {}

    for provider in providers:
        cfg = PROVIDER_CONFIG[provider]
        if cfg["env_key"] not in os.environ or not os.environ[cfg["env_key"]]:
            print(f"\nSkipping {provider}: {cfg['env_key']} not set.")
            continue
        try:
            result = run_zero_shot(
                provider, test_df,
                samples_per_class=args.samples_per_class,
            )
            all_results[result["label"]] = result
        except Exception as e:
            print(f"\nError running {provider}: {e}")

    # ── Analysis plots ────────────────────────────────────────────────────────
    if all_results:
        from analysis import (
            plot_confusion_matrix, plot_per_class_f1,
            plot_model_comparison, plot_suicidal_recall_comparison,
            print_comparison_table, qualitative_suicidal_analysis,
        )
        for name, res in all_results.items():
            plot_confusion_matrix(res["true"], res["preds"], name)
            plot_per_class_f1(res["true"], res["preds"], name)
            qualitative_suicidal_analysis(
                res["test_df"], res["true"], res["preds"],
                save_path=os.path.join(
                    PLOTS_DIR,
                    f"suicidal_misclassifications_{res['provider']}.txt",
                ),
            )

        summary = {
            n: {
                "accuracy":        r["accuracy"],
                "f1_macro":        r["f1_macro"],
                "suicidal_recall": r["suicidal_recall"],
            }
            for n, r in all_results.items()
        }
        plot_model_comparison(summary)
        plot_suicidal_recall_comparison(summary)
        print_comparison_table(summary)
