import joblib
import numpy as np

# Load the trained model and feature info
model = joblib.load("models/malaria_symptoms_model.joblib")
feature_info = joblib.load("models/symptoms_feature_info.joblib")

# Get feature columns
feature_columns = feature_info['feature_columns']
print(f"Feature columns: {feature_columns}")

# Test different scenarios
scenarios = [
    ("No symptoms, age 25", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25]),
    ("Fever only, age 25", [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25]),
    ("Fever + chills, age 25", [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 25]),
    ("All symptoms, age 25", [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 25]),
]

for name, data in scenarios:
    test_data = np.array([data])
    
    # Get prediction and probabilities
    prediction = model.predict(test_data)
    probabilities = model.predict_proba(test_data)
    
    print(f"\n{name}:")
    print(f"  Prediction: {prediction[0]}")
    print(f"  All probabilities: {dict(zip(model.classes_, probabilities[0]))}")
    
    # Find the probability of the predicted class
    pred_index = np.where(model.classes_ == prediction[0])[0][0]
    probability = probabilities[0][pred_index]
    print(f"  Confidence in prediction: {probability:.2f}")