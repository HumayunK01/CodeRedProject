import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.impute import SimpleImputer

def train_and_save_dhs_model():
    print("🚀 Starting DHS Model Training Pipeline...")
    
    # 1. Configuration
    # Assumes script is run from project root; adjust if needed
    BASE_DIR = os.getcwd()
    DHS_PATH = os.path.join(BASE_DIR, "data_private/dhs/india/raw/IAKR7EFL.DTA")
    MODEL_DIR = os.path.join(BASE_DIR, "apps/inference/models")
    SAVE_PATH = os.path.join(MODEL_DIR, "malaria_symptoms_dhs.pkl")
    
    FEATURE_COLUMNS = {
        "fever": "h22",               # Fever in last 2 weeks
        "age_months": "b19",          # Child age in months
        "state": "v024",              # State
        "residence_type": "v025",     # Urban / Rural
        "slept_under_net": "ml0",     # ITN usage
        "anemia_level": "hw57",       # Anemia severity (proxy risk)
        "interview_month": "v006"     # Seasonality signal
    }
    
    CHUNK_SIZE = 50000

    # 2. Load Data
    print(f"Reading {DHS_PATH}...")
    if not os.path.exists(DHS_PATH):
        raise FileNotFoundError(f"DHS data file not found at {DHS_PATH}")

    chunks = []
    required_cols = list(FEATURE_COLUMNS.values())
    rename_map = {v: k for k, v in FEATURE_COLUMNS.items()}

    try:
        with pd.read_stata(
            DHS_PATH,
            columns=required_cols,
            convert_categoricals=False,
            iterator=True,
            chunksize=CHUNK_SIZE
        ) as reader:
            for i, chunk in enumerate(reader):
                chunk = chunk.rename(columns=rename_map)
                # Drop rows where fever is missing (key symptom)
                chunk = chunk.dropna(subset=["fever"], how='all')
                chunks.append(chunk)
                print(f"  Processed Chunk {i+1}: {chunk.shape[0]} rows kept")
        
        symptom_df = pd.concat(chunks, ignore_index=True)
        print(f"Data Loaded: {symptom_df.shape} rows")

    except Exception as e:
        print(f"❌ Error reading data: {e}")
        return

    # 3. Label Generation (Rule-Based for Training Target)
    print("Generating labels based on clinical rules...")
    risk_df = symptom_df.copy()
    
    # Clean DHS codes (8 -> NaN)
    risk_df['fever'] = risk_df['fever'].replace(8, np.nan)
    risk_df['slept_under_net'] = risk_df['slept_under_net'].replace(8, np.nan)
    
    # Initialize Risk
    risk_df['malaria_risk'] = 0  # Low Risk
    
    # Apply Rules
    has_fever = (risk_df['fever'] == 1)
    used_net = (risk_df['slept_under_net'] == 1)
    no_net = (risk_df['slept_under_net'] == 0) | (risk_df['slept_under_net'].isna())
    severe_anemia = risk_df['anemia_level'].isin([1, 2]) # 1=Severe, 2=Moderate

    # Medium Risk: Fever + Net
    risk_df.loc[has_fever & used_net, 'malaria_risk'] = 1
    # High Risk: Fever + No Net OR Fever + Anemia
    risk_df.loc[has_fever & no_net, 'malaria_risk'] = 2
    risk_df.loc[has_fever & severe_anemia, 'malaria_risk'] = 2
    
    print(f"Risk Distribution:\n{risk_df['malaria_risk'].value_counts().sort_index()}")

    # 4. Preprocessing for Model
    print("Preprocessing for ML...")
    model_df = risk_df.copy()
    
    # Clean Anemia '8' if present
    model_df['anemia_level'] = model_df['anemia_level'].replace(8, np.nan)
    
    # Impute Missing Values
    # Use -1 so model sees missingness as a pattern
    cols_to_impute = ['fever', 'age_months', 'slept_under_net', 'anemia_level', 'interview_month']
    imputer = SimpleImputer(strategy='constant', fill_value=-1)
    model_df[cols_to_impute] = imputer.fit_transform(model_df[cols_to_impute])
    
    # Encode Categoricals
    le_state = LabelEncoder()
    model_df['state'] = le_state.fit_transform(model_df['state'].astype(str))
    
    le_res = LabelEncoder()
    model_df['residence_type'] = le_res.fit_transform(model_df['residence_type'].astype(str))
    
    # 5. Training
    print("Training RandomForest Classifier...")
    feature_names = ['fever', 'age_months', 'state', 'residence_type', 'slept_under_net', 'anemia_level', 'interview_month']
    X = model_df[feature_names]
    y = model_df['malaria_risk']
    
    # Stratified Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    
    rf_model = RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train)
    
    accuracy = rf_model.score(X_test, y_test)
    print(f"Model Trained. Accuracy: {accuracy:.4f}")

    # 6. Saving Bundle
    print(f"Saving model bundle to {SAVE_PATH}...")
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    model_bundle = {
        "model": rf_model,
        "imputer": imputer,
        "le_state": le_state,
        "le_res": le_res,
        "features": feature_names,
        "cols_to_impute": cols_to_impute
    }
    
    joblib.dump(model_bundle, SAVE_PATH)
    print(f"✅ Model successfully saved to {SAVE_PATH}")

if __name__ == "__main__":
    train_and_save_dhs_model()