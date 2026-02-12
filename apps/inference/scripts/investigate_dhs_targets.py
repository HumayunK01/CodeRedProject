"""
DHS Malaria Data Investigation - Check for Actual Test Results
This script explores the DHS dataset to find actual malaria test outcomes
"""
import pandas as pd
import numpy as np

# DHS file path - Kids Recode (KR) file
import os
# Go from scripts/ -> inference/ -> CodeRedProject/
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
dhs_path = os.path.join(project_root, "data_private", "dhs", "india", "raw", "IAKR7EFL.DTA")
print(f"Looking for DHS data at: {dhs_path}")

print("="*70)
print("DHS DATA INVESTIGATION - MALARIA TEST RESULTS")
print("="*70)

# Read a small sample to inspect column names
print("\n📊 Reading DHS metadata...")
try:
    # Read just 100 rows to inspect columns quickly
    sample = pd.read_stata(dhs_path, iterator=True, convert_categoricals=False)
    df_sample = sample.get_chunk(100)
    
    print(f"\n✅ Dataset loaded: {dhs_path}")
    print(f"   Sample shape: {df_sample.shape}")
    print(f"   Total columns: {len(df_sample.columns)}")
    
    # Search for malaria-related columns
    print("\n🔍 Searching for malaria test result columns...")
    malaria_cols = [col for col in df_sample.columns if 'hml' in col.lower() or 
                    'mal' in col.lower() or 'rdt' in col.lower() or 
                    'microscopy' in col.lower()]
    
    if malaria_cols:
        print(f"\n✅ Found {len(malaria_cols)} malaria-related columns:")
        for col in malaria_cols:
            print(f"   - {col}")
            # Show value counts for first few rows
            if col in df_sample.columns:
                unique_vals = df_sample[col].dropna().unique()[:10]
                print(f"     Sample values: {unique_vals}")
    else:
        print("\n⚠️ No malaria test result columns found in standard naming")
    
    # Show all column names containing 'h' (health module)
    print("\n📋 All health-related columns (h*):")
    health_cols = sorted([col for col in df_sample.columns if col.startswith('h')])
    print(f"   Total: {len(health_cols)}")
    if len(health_cols) <= 50:
        for col in health_cols:
            print(f"   - {col}")
    else:
        print(f"   First 50: {health_cols[:50]}")
        print(f"   ... ({len(health_cols)-50} more)")
    
    # Specific columns we're using
    print("\n📌 Current feature columns:")
    current_features = {
        "fever": "h22",
        "age_months": "b19",
        "state": "v024",
        "residence_type": "v025",
        "slept_under_net": "ml0",
        "anemia_level": "hw57",
        "interview_month": "v006"
    }
    for name, code in current_features.items():
        if code in df_sample.columns:
            print(f"   ✅ {name:20} ({code})")
        else:
            print(f"   ❌ {name:20} ({code}) - NOT FOUND")
    
    # Check for malaria test columns specifically
    # Common DHS malaria variables:
    # hml35 = Result of malaria test
    # hml32 = Type of malaria test (RDT/Microscopy)
    test_result_candidates = ['hml35', 'hml32', 'hml1', 'hml2', 'sh47']
    
    print("\n🎯 Checking specific malaria test variables:")
    for var in test_result_candidates:
        if var in df_sample.columns:
            print(f"   ✅ {var} exists!")
            print(f"      Values: {df_sample[var].value_counts().to_dict()}")
        else:
            print(f"   ❌ {var} not found")
    
except FileNotFoundError:
    print(f"\n❌ ERROR: File not found: {dhs_path}")
    print("   Please ensure the DHS data is in the correct location")
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*70)
print("RECOMMENDATION:")
print("="*70)
print("""
If actual malaria test results are found (e.g., hml35):
  → Retrain as TRUE PREDICTION MODEL with real targets

If NO test results available:
  → Reframe as "CLINICAL RISK INDEX SCORING MODEL"
  → Update documentation to clarify it's a risk calculator, not predictor
  → Rename model description and API endpoints appropriately
""")
print("="*70)
