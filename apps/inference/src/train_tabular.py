# src/train_tabular.py
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import os
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

df = pd.read_csv("data/reported_numbers.csv")
# you must adapt these column names to your CSV:
# assume df has columns 'Year' and 'No_of_cases' or 'Cases'
cases_col = [c for c in df.columns if 'case' in c.lower()][0]
# aggregate by year for a country or use full dataset depending on structure
# Here we'll use the raw values and simple synthetic features (example)
df = df.dropna(subset=[cases_col])
df['cases'] = df[cases_col].astype(float)

# Example features: year (as numeric)
df['year'] = pd.to_numeric(df['Year'], errors='coerce')
df = df.dropna(subset=['year'])
X = df[['year']].values
y = pd.cut(df['cases'], bins=3, labels=['Low','Medium','High'])

# Train/test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
])

pipe.fit(X_train, y_train)
os.makedirs("models", exist_ok=True)
joblib.dump(pipe, "models/malaria_model.joblib")
print("Saved models/malaria_model.joblib")
