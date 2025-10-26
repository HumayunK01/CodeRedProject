# src/kb/build_kb.py
"""
Build a TF-IDF index from data/faq.csv and save vectorizer + answers.
Run this once whenever you update faq.csv.
"""

import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib

DATA_PATH = os.path.join("data", "faq.csv")
OUT_DIR = "models"
VEC_PATH = os.path.join(OUT_DIR, "tfidf_vectorizer.joblib")
MAT_PATH = os.path.join(OUT_DIR, "tfidf_matrix.joblib")
ANS_PATH = os.path.join(OUT_DIR, "answers.joblib")

os.makedirs(OUT_DIR, exist_ok=True)

def load_faq(path=DATA_PATH):
    df = pd.read_csv(path)
    # basic cleaning
    df = df.dropna(subset=["question", "answer"]).astype(str)
    df['text'] = df['question'].str.strip()  # we index by question; you can combine Q+A if desired
    return df

def build_and_save():
    df = load_faq()
    corpus = df['text'].tolist()
    vect = TfidfVectorizer(lowercase=True, stop_words='english', ngram_range=(1,2))
    X = vect.fit_transform(corpus)
    answers = df['answer'].tolist()

    joblib.dump(vect, VEC_PATH)
    joblib.dump(X, MAT_PATH, compress=3)
    joblib.dump(answers, ANS_PATH, compress=3)

    print("Saved vectorizer ->", VEC_PATH)
    print("Saved tfidf matrix ->", MAT_PATH)
    print("Saved answers ->", ANS_PATH)
    print(f"{len(answers)} FAQs indexed.")

if __name__ == "__main__":
    build_and_save()
