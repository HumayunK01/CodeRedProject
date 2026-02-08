# train_symptoms_model.py
# Train a proper model for symptom-based malaria risk assessment

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

def create_synthetic_symptoms_data(n_samples=1000):
    """
    Create synthetic symptom data for malaria risk assessment training.
    In a real scenario, this would come from actual medical data.
    """
    np.random.seed(42)
    
    # Generate synthetic symptom data
    data = {
        'fever': np.random.choice([0, 1], n_samples, p=[0.3, 0.7]),
        'chills': np.random.choice([0, 1], n_samples, p=[0.4, 0.6]),
        'headache': np.random.choice([0, 1], n_samples, p=[0.5, 0.5]),
        'fatigue': np.random.choice([0, 1], n_samples, p=[0.4, 0.6]),
        'muscle_aches': np.random.choice([0, 1], n_samples, p=[0.3, 0.7]),
        'nausea': np.random.choice([0, 1], n_samples, p=[0.4, 0.6]),
        'diarrhea': np.random.choice([0, 1], n_samples, p=[0.3, 0.7]),
        'abdominal_pain': np.random.choice([0, 1], n_samples, p=[0.4, 0.6]),
        'cough': np.random.choice([0, 1], n_samples, p=[0.2, 0.8]),
        'skin_rash': np.random.choice([0, 1], n_samples, p=[0.1, 0.9]),
        'age': np.random.randint(1, 80, n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # Create a more realistic risk score based on symptoms
    # Malaria symptoms weighted by clinical relevance
    symptom_weights = {
        'fever': 0.15,
        'chills': 0.12,
        'headache': 0.08,
        'fatigue': 0.10,
        'muscle_aches': 0.08,
        'nausea': 0.07,
        'diarrhea': 0.06,
        'abdominal_pain': 0.06,
        'cough': 0.03,
        'skin_rash': 0.02
    }
    
    # Calculate risk score
    risk_score = np.zeros(n_samples)
    for symptom, weight in symptom_weights.items():
        risk_score += df[symptom] * weight
    
    # Age factor (higher risk for young children and elderly)
    age_factor = np.where(df['age'] < 5, 0.15, np.where(df['age'] > 65, 0.12, 0.05))
    risk_score += age_factor
    
    # Add some noise to make it more realistic
    risk_score += np.random.normal(0, 0.05, n_samples)
    
    # Ensure risk score is between 0 and 1
    risk_score = np.clip(risk_score, 0, 1)
    
    # Create risk categories
    df['risk_score'] = risk_score
    df['risk_level'] = pd.cut(risk_score, 
                             bins=[0, 0.3, 0.6, 1.0], 
                             labels=['Low', 'Medium', 'High'])
    
    return df

def train_symptoms_model():
    """Train a model for symptom-based malaria risk assessment"""
    
    # Create synthetic training data
    print("Creating synthetic symptom data...")
    df = create_synthetic_symptoms_data(2000)
    
    print(f"Dataset shape: {df.shape}")
    print(f"Risk level distribution:\n{df['risk_level'].value_counts()}")
    
    # Prepare features and target
    feature_columns = [
        'fever', 'chills', 'headache', 'fatigue', 'muscle_aches',
        'nausea', 'diarrhea', 'abdominal_pain', 'cough', 'skin_rash', 'age'
    ]
    
    X = df[feature_columns]
    y = df['risk_level']
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Train the model
    print("Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        class_weight='balanced'
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate the model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Model accuracy: {accuracy:.3f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save the model and feature columns
    os.makedirs("models", exist_ok=True)
    
    # Save the trained model
    joblib.dump(model, "models/malaria_symptoms_model.joblib")
    print("Saved models/malaria_symptoms_model.joblib")
    
    # Save feature columns for use in prediction
    feature_info = {
        'feature_columns': feature_columns
    }
    joblib.dump(feature_info, "models/symptoms_feature_info.joblib")
    print("Saved models/symptoms_feature_info.joblib")
    
    return model

if __name__ == "__main__":
    train_symptoms_model()