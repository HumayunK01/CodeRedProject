import joblib
import numpy as np

# Load the trained model and feature info
model = joblib.load("models/malaria_symptoms_model.joblib")
feature_info = joblib.load("models/symptoms_feature_info.joblib")

# Get feature columns
feature_columns = feature_info['feature_columns']
print(f"Feature columns: {feature_columns}")

# Create a test case with no symptoms for a 25-year-old
test_data = np.array([[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25]])  # All symptoms False, age 25

# Get prediction and probabilities
prediction = model.predict(test_data)
probabilities = model.predict_proba(test_data)

print(f"Prediction: {prediction[0]}")
print(f"Class probabilities: {probabilities[0]}")
print(f"Classes: {model.classes_}")

# Find the probability of the predicted class
pred_index = np.where(model.classes_ == prediction[0])[0][0]
probability = probabilities[0][pred_index]
print(f"Probability of predicted class: {probability}")