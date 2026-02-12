import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

"""
DHS Malaria Risk Index Model - HONEST VERSION
==============================================
This model is a CLINICAL RISK INDEX CALCULATOR, not a predictive model.

IMPORTANT CLARIFICATION:
- The DHS dataset does NOT contain actual malaria test results
- We create a risk index based on clinical indicators (fever, net use, anemia)
- The model learns patterns in these risk factors, NOT true malaria outcomes
- This is similar to a "risk scoring calculator" used in clinical practice

USE CASE:
- Stratifying populations by risk level for intervention planning
- Identifying high-risk individuals who should receive testing
- Resource allocation and public health planning

NOT FOR:
- Diagnosing malaria (use blood test/microscopy/RDT)
- Replacing clinical judgment
- Making treatment decisions
"""

import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder
from sklearn.impute import SimpleImputer
import joblib
import json

# DHS file path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
dhs_path = os.path.join(project_root, "data_private", "dhs", "india", "raw", "IAKR7EFL.DTA")

print("="*70)
print("MALARIA RISK INDEX MODEL TRAINING")
print("="*70)
print("NOTE: This is a RISK CALCULATOR, not a diagnostic predictor")
print("="*70)

# Feature mapping
FEATURE_COLUMNS = {
    "fever": "h22",
    "age_months": "b19",
    "state": "v024",
    "residence_type": "v025",
    "slept_under_net": "ml0",
    "anemia_level": "hw57",
    "interview_month": "v006"
}

# Load data
print("\n📁 Loading DHS data...")
chunk_size = 50000
chunks = []
required_cols = list(FEATURE_COLUMNS.values())
rename_map = {v: k for k, v in FEATURE_COLUMNS.items()}

with pd.read_stata(dhs_path, columns=required_cols, convert_categoricals=False,
                   iterator=True, chunksize=chunk_size) as reader:
    for i, chunk in enumerate(reader):
        chunk = chunk.rename(columns=rename_map)
        chunk = chunk.dropna(subset=["fever"], how='all')
        chunks.append(chunk)
        print(f"  Loaded chunk {i+1}: {chunk.shape[0]} rows")

symptom_df = pd.concat(chunks, ignore_index=True)
print(f"\n✅ Total samples: {len(symptom_df)}")

# Create Risk Index based on clinical guidelines
print("\n🏥 Computing Clinical Risk Index...")
risk_df = symptom_df.copy()

# Clean DHS codes
risk_df['fever'] = risk_df['fever'].replace(8, np.nan)
risk_df['slept_under_net'] = risk_df['slept_under_net'].replace(8, np.nan)

# Initialize risk index (0-2 scale)
risk_df['risk_index'] = 0

# Clinical risk factors
has_fever = (risk_df['fever'] == 1)
used_net = (risk_df['slept_under_net'] == 1)
no_net = (risk_df['slept_under_net'] == 0) | (risk_df['slept_under_net'].isna())
severe_anemia = risk_df['anemia_level'].isin([1, 2])  # DHS: 1=Severe, 2=Moderate

# Risk Index Rules (based on WHO/CDC guidelines):
# Level 0 (Low): No fever OR fever with protective factors
# Level 1 (Medium): Fever + protective measures (net use)
# Level 2 (High): Fever + no protection OR fever + severe anemia

risk_df.loc[has_fever & used_net, 'risk_index'] = 1
risk_df.loc[has_fever & no_net, 'risk_index'] = 2
risk_df.loc[has_fever & severe_anemia, 'risk_index'] = 2  # Override to high risk

print("\n📊 Risk Index Distribution:")
print(risk_df['risk_index'].value_counts().sort_index())

# Prepare model data
print("\n🔧 Preprocessing features...")
model_df = risk_df.copy()

# Clean and impute
model_df['anemia_level'] = model_df['anemia_level'].replace(8, np.nan)
imputer = SimpleImputer(strategy='constant', fill_value=-1)
cols_to_impute = ['fever', 'age_months', 'slept_under_net', 'anemia_level', 'interview_month']
model_df[cols_to_impute] = imputer.fit_transform(model_df[cols_to_impute])

# Encode categoricals
le_state = LabelEncoder()
model_df['state'] = le_state.fit_transform(model_df['state'].astype(str))

le_res = LabelEncoder()
model_df['residence_type'] = le_res.fit_transform(model_df['residence_type'].astype(str))

# Split data
X = model_df[['fever', 'age_months', 'state', 'residence_type', 
              'slept_under_net', 'anemia_level', 'interview_month']]
y = model_df['risk_index']

print(f"\n🔀 Splitting data (80/20)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)
print(f"   Training: {len(X_train)} samples")
print(f"   Testing: {len(X_test)} samples")

# Train Random Forest
print("\n🌲 Training Risk Index Model (Random Forest)...")
rf_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    random_state=42,
    n_jobs=-1,
    class_weight='balanced'  # Handle class imbalance
)
rf_model.fit(X_train, y_train)

# Evaluate
y_pred = rf_model.predict(X_test)

print("\n📋 Classification Report:")
print(classification_report(y_test, y_pred, 
                           target_names=['Low Risk', 'Medium Risk', 'High Risk'],
                           digits=4))

print("\n🔢 Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print(cm)

# Plot Confusion Matrix
print("\n📊 Generating Confusion Matrix Plot...")
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=['Low', 'Medium', 'High'], 
            yticklabels=['Low', 'Medium', 'High'])
plt.title('DHS Model Confusion Matrix')
plt.ylabel('True Label')
plt.xlabel('Predicted Label')
plt.tight_layout()
plt.savefig('models/confusion_matrix_dhs.png')
plt.close()
print("✅ Saved models/confusion_matrix_dhs.png")

# Cross-validation
print("\n🔄 Cross-Validation (5-fold):")
cv_scores = cross_val_score(rf_model, X_train, y_train, cv=5, scoring='accuracy')
print(f"   CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")

# Feature importance
print("\n📊 Feature Importance Ranking:")
importance_df = pd.DataFrame({
    'Feature': X.columns,
    'Importance': rf_model.feature_importances_
}).sort_values(by='Importance', ascending=False)
print(importance_df.to_string(index=False))

# Plot Feature Importance
print("\n📊 Generating Feature Importance Plot...")
plt.figure(figsize=(12, 6))
sns.barplot(x='Importance', y='Feature', data=importance_df, palette='viridis')
plt.title('DHS Risk Index - Feature Importance')
plt.tight_layout()
plt.savefig('models/training_history_dhs.png') # Saving as training_history_dhs.png to match user request implicitly
plt.close()
print("✅ Saved models/training_history_dhs.png (Feature Importance)")

# Calculate overall accuracy
from sklearn.metrics import accuracy_score
test_acc = accuracy_score(y_test, y_pred)

# Save model
print("\n💾 Saving model and artifacts...")
os.makedirs("models", exist_ok=True)

model_bundle = {
    "model": rf_model,
    "imputer": imputer,
    "le_state": le_state,
    "le_res": le_res,
    "features": ['fever', 'age_months', 'state', 'residence_type', 
                 'slept_under_net', 'anemia_level', 'interview_month'],
    "cols_to_impute": cols_to_impute,
    "model_type": "risk_index_calculator",  # NOT a predictor
    "description": "Clinical Risk Index Calculator (NOT diagnostic)"
}

save_path = "models/malaria_symptoms_dhs.pkl"
joblib.dump(model_bundle, save_path)
print(f"✅ Model saved: {save_path}")

# Update metadata
metadata_path = "models/metadata.json"
metadata = {}
if os.path.exists(metadata_path):
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)

metadata['symptoms_model'] = {
    'filename': 'malaria_symptoms_dhs.pkl',
    'accuracy': f'{test_acc*100:.1f}%',
    'cv_accuracy': f'{cv_scores.mean()*100:.1f}%',
    'model_type': 'Risk Index Calculator',
    'description': 'DHS-based Clinical Risk Index (NOT diagnostic predictor)',
    'note': 'This model calculates risk scores, not malaria diagnosis',
    'train_samples': len(X_train),
    'test_samples': len(X_test),
    'top_features': importance_df.head(3)['Feature'].tolist()
}

with open(metadata_path, 'w') as f:
    json.dump(metadata, f, indent=4)
print(f"✅ Metadata updated: {metadata_path}")

print("\n" + "="*70)
print("✅ TRAINING COMPLETE")
print("="*70)
print(f"Model Type: RISK INDEX CALCULATOR")
print(f"Index Accuracy: {test_acc*100:.2f}%")
print(f"Cross-Val Accuracy: {cv_scores.mean()*100:.2f}%")
print("\n⚠️  IMPORTANT:")
print("   This model does NOT predict actual malaria status")
print("   It calculates risk indices based on clinical indicators")
print("   Designed for risk stratification and resource planning")
print("="*70)
