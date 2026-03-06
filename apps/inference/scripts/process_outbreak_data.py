import os

import pandas as pd

# Resolve paths relative to the project root (one level up from scripts/)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def process_covid_data(
    input_file=None,
    output_file=None
):
    if input_file is None:
        input_file = os.path.join(BASE_DIR, "data", "time_series_covid_19_confirmed.csv")
    if output_file is None:
        output_file = os.path.join(BASE_DIR, "data", "processed_outbreaks.csv")
    print("Loading COVID-19 dataset...")
    df = pd.read_csv(input_file)

    # We only care about Country/Region, and the date columns
    # Drop Province/State, Lat, Long
    df = df.drop(columns=['Province/State', 'Lat', 'Long'])

    # Group by Country/Region to aggregate provinces (like China, Australia, etc.)
    df = df.groupby('Country/Region').sum().reset_index()

    print("Melting dataset from wide to long format...")
    # Melt the dataframe so dates are rows
    df_melted = pd.melt(df, id_vars=['Country/Region'], var_name='Date', value_name='Cumulative_Cases')

    # Rename columns for standardization
    df_melted = df_melted.rename(columns={'Country/Region': 'Region'})
    df_melted['Disease'] = 'COVID-19'

    # Convert Date to datetime
    print("Converting dates and calculating new weekly cases...")
    df_melted['Date'] = pd.to_datetime(df_melted['Date'])

    # Sort values to calculate new cases correctly
    df_melted = df_melted.sort_values(by=['Region', 'Date'])

    # Calculate daily new cases (difference from previous day)
    df_melted['New_Cases'] = df_melted.groupby('Region')['Cumulative_Cases'].diff().fillna(df_melted['Cumulative_Cases'])
    # Prevent negative new cases due to data corrections
    df_melted['New_Cases'] = df_melted['New_Cases'].clip(lower=0)

    # Now, let's group by week. Outbreak forecasting is usually done weekly.
    # Set Date as index
    df_melted.set_index('Date', inplace=True)

    # Group by Region and Disease, then resample weekly ('W') and sum the new cases
    weekly_df = df_melted.groupby(['Region', 'Disease']).resample('W')['New_Cases'].sum().reset_index()

    # Reorder columns
    weekly_df = weekly_df[['Date', 'Region', 'Disease', 'New_Cases']]

    # Save the processed data
    weekly_df.to_csv(output_file, index=False)
    print(f"✅ Successfully processed and saved to {output_file}!")
    print(f"Total rows: {len(weekly_df)}")
    print("\nPreview of processed data:")
    print(weekly_df.head(10))

if __name__ == "__main__":
    process_covid_data()
