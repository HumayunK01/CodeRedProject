import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from collections import deque
import warnings

# Suppress sklearn warnings about feature names
warnings.filterwarnings("ignore")

WINDOW_SIZE = 8 # Look back 8 weeks to predict the next week

def create_sliding_window_data(df, window_size=WINDOW_SIZE):
    """
    Converts time series data into X (past weeks) and Y (next week)
    """
    X, y = [], []
    
    # Group by region to prevent sliding windows from mixing countries
    for region, group in df.groupby('Region'):
        cases = group['New_Cases'].values
        if len(cases) <= window_size:
            continue
            
        for i in range(len(cases) - window_size):
            X.append(cases[i:i+window_size])
            y.append(cases[i+window_size])
            
    return np.array(X), np.array(y)

def train_model():
    print("Loading processed outbreak data...")
    df = pd.read_csv('data/processed_outbreaks.csv')
    
    print("Creating sliding window features...")
    X, y = create_sliding_window_data(df, WINDOW_SIZE)
    
    # We must scale the data because different countries have vastly different population sizes
    # We will scale X using log1p to handle zeros gracefully and normalize the exponential curves
    X_scaled = np.log1p(X)
    y_scaled = np.log1p(y)
    
    print(f"Training dataset shape: X={X_scaled.shape}, y={y_scaled.shape}")
    
    # A powerful, modern gradient boosting model that handles non-linear patterns exceptionally well
    model = HistGradientBoostingRegressor(max_iter=200, learning_rate=0.1, max_depth=10, random_state=42)
    
    print("Training generalized forecasting model... (This learns the shape of outbreaks)")
    model.fit(X_scaled, y_scaled)
    
    # Save the model
    print("Saving the AI model to disk...")
    joblib.dump(model, 'outbreak_forecaster.pkl')
    print("✅ Model trained and saved as 'outbreak_forecaster.pkl'!")
    
    # Let's run a quick simulation to prove it works
    print("\n--- Simulation Test ---")
    india_data = df[df['Region'] == 'India']['New_Cases'].values
    if len(india_data) > WINDOW_SIZE:
        # Take the last 8 weeks of actual data
        recent_history = india_data[-WINDOW_SIZE:]
        print(f"Actual last {WINDOW_SIZE} weeks for India: {recent_history.astype(int)}")
        
        # Predict the next 4 weeks
        predictions = []
        current_window = deque(recent_history, maxlen=WINDOW_SIZE)
        
        for _ in range(4):
            # Format and scale input
            input_feat = np.array([current_window])
            input_scaled = np.log1p(input_feat)
            
            # Predict
            pred_scaled = model.predict(input_scaled)[0]
            pred_actual = np.expm1(pred_scaled) # Reverse the log1p scale
            
            # Store prediction and slide window
            # Ensure it doesn't predict sub-zero
            pred_actual = max(0, int(pred_actual))
            predictions.append(pred_actual)
            current_window.append(pred_actual)
            
        print(f"🤖 FORECAST FOR NEXT 4 WEEKS: {predictions}")

if __name__ == "__main__":
    train_model()
