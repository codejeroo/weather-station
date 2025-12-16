"""
Figure 4.6, 4.7, 4.8: Prediction vs. Actual Readings Visualization (1-Hour Horizon - November Data)
Generates line graphs comparing XGBoost predictions with actual sensor data
for Temperature, Humidity, and Soil Moisture with 1-hour forecast horizon
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import TimeSeriesSplit
import xgboost as xgb
import pickle
import warnings
warnings.filterwarnings('ignore')

print("="*80)
print("GENERATING 1-HOUR FORECAST VISUALIZATIONS (NOVEMBER DATA)")
print("="*80)

# ============================================================================
# LOAD DATA & MODELS
# ============================================================================
print("\n[1] Loading sensor data...")
df = pd.read_csv('sensor_logs.csv')
df['created_at'] = pd.to_datetime(df['created_at'])
# Filter for November data only
df = df[df['created_at'].dt.month == 11]
df = df.sort_values(['node_id', 'created_at']).reset_index(drop=True)
print(f"✓ Filtered to November data: {len(df):,} records")

# ============================================================================
# PREPARE DATA FOR VISUALIZATION
# ============================================================================
print("\n[2] Preparing test dataset (1-hour horizon)...")

def create_horizon_dataset(df, horizon_steps, node_list=['node_1', 'node_2']):
    """Create training dataset for a specific horizon"""
    X_list = []
    y_temp = []
    y_hum = []
    y_soil = []
    indices = []
    
    for node in node_list:
        node_df = df[df['node_id'] == node].reset_index(drop=True)
        max_lookback = 48  # 4 hours
        
        for i in range(max_lookback, len(node_df) - horizon_steps):
            window_30 = node_df.iloc[i-6:i]
            window_1h = node_df.iloc[i-12:i]
            window_2h = node_df.iloc[i-24:i]
            window_4h = node_df.iloc[i-48:i]
            
            temp_30_mean = window_30['temperature'].mean()
            temp_30_std = window_30['temperature'].std() or 0
            temp_30_range = window_30['temperature'].max() - window_30['temperature'].min()
            
            temp_1h_mean = window_1h['temperature'].mean()
            temp_1h_std = window_1h['temperature'].std() or 0
            temp_1h_trend = window_1h['temperature'].iloc[-1] - window_1h['temperature'].iloc[0]
            
            temp_2h_mean = window_2h['temperature'].mean()
            temp_2h_std = window_2h['temperature'].std() or 0
            
            temp_4h_mean = window_4h['temperature'].mean()
            temp_4h_std = window_4h['temperature'].std() or 0
            
            hum_30_mean = window_30['humidity'].mean()
            hum_30_std = window_30['humidity'].std() or 0
            hum_30_range = window_30['humidity'].max() - window_30['humidity'].min()
            
            hum_1h_mean = window_1h['humidity'].mean()
            hum_1h_std = window_1h['humidity'].std() or 0
            hum_1h_trend = window_1h['humidity'].iloc[-1] - window_1h['humidity'].iloc[0]
            
            hum_2h_mean = window_2h['humidity'].mean()
            hum_2h_std = window_2h['humidity'].std() or 0
            
            hum_4h_mean = window_4h['humidity'].mean()
            hum_4h_std = window_4h['humidity'].std() or 0
            
            pressure_mean = window_4h['pressure'].mean()
            pressure_std = window_4h['pressure'].std() or 0
            pressure_trend = window_1h['pressure'].iloc[-1] - window_1h['pressure'].iloc[0]
            
            soil_mean = window_4h['soil_moisture'].mean()
            soil_std = window_4h['soil_moisture'].std() or 0
            
            hour_of_day = node_df['created_at'].iloc[i].hour
            hour_sin = np.sin(2 * np.pi * hour_of_day / 24)
            hour_cos = np.cos(2 * np.pi * hour_of_day / 24)
            
            node_code = 1 if node == 'node_2' else 0
            
            features = [
                temp_30_mean, temp_30_std, temp_30_range,
                temp_1h_mean, temp_1h_std, temp_1h_trend,
                temp_2h_mean, temp_2h_std,
                temp_4h_mean, temp_4h_std,
                hum_30_mean, hum_30_std, hum_30_range,
                hum_1h_mean, hum_1h_std, hum_1h_trend,
                hum_2h_mean, hum_2h_std,
                hum_4h_mean, hum_4h_std,
                pressure_mean, pressure_std, pressure_trend,
                soil_mean, soil_std,
                node_df['altitude'].iloc[i],
                hour_sin, hour_cos,
                node_code,
            ]
            
            X_list.append(features)
            y_temp.append(node_df['temperature'].iloc[i + horizon_steps])
            y_hum.append(node_df['humidity'].iloc[i + horizon_steps])
            y_soil.append(node_df['soil_moisture'].iloc[i + horizon_steps])
            indices.append(i + horizon_steps)
    
    return np.array(X_list), np.array(y_temp), np.array(y_hum), np.array(y_soil), indices

# Use 1-hour horizon for visualization (good balance of samples & interpretability)
horizon_steps = 12  # 1 hour
X, y_temp, y_hum, y_soil, indices = create_horizon_dataset(df, horizon_steps, node_list=['node_1'])

print(f"✓ Dataset created: {len(X):,} samples for 1-hour forecast")

# ============================================================================
# TRAIN MODELS & GET PREDICTIONS
# ============================================================================
print("\n[3] Training models for prediction vs. actual comparison...")

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Use time-series split for proper validation
tscv = TimeSeriesSplit(n_splits=3)
split_data = list(tscv.split(X_scaled))
train_idx, test_idx = split_data[-1]

X_train, X_test = X_scaled[train_idx], X_scaled[test_idx]
yt_train, yt_test = y_temp[train_idx], y_temp[test_idx]
yh_train, yh_test = y_hum[train_idx], y_hum[test_idx]
ys_train, ys_test = y_soil[train_idx], y_soil[test_idx]

# Train temperature model
print("  Training temperature model...")
temp_model = xgb.XGBRegressor(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    verbosity=0
)
temp_model.fit(X_train, yt_train)
yt_pred = temp_model.predict(X_test)
temp_rmse = np.sqrt(np.mean((yt_test - yt_pred)**2))
temp_r2 = 1 - (np.sum((yt_test - yt_pred)**2) / np.sum((yt_test - np.mean(yt_test))**2))
print(f"  ✓ Temperature: RMSE={temp_rmse:.4f}°C, R²={temp_r2:.4f}")

# Train humidity model
print("  Training humidity model...")
hum_model = xgb.XGBRegressor(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    verbosity=0
)
hum_model.fit(X_train, yh_train)
yh_pred = hum_model.predict(X_test)
hum_rmse = np.sqrt(np.mean((yh_test - yh_pred)**2))
hum_r2 = 1 - (np.sum((yh_test - yh_pred)**2) / np.sum((yh_test - np.mean(yh_test))**2))
print(f"  ✓ Humidity: RMSE={hum_rmse:.4f}%, R²={hum_r2:.4f}")

# Train soil moisture model
print("  Training soil moisture model...")
soil_model = xgb.XGBRegressor(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    verbosity=0
)
soil_model.fit(X_train, ys_train)
ys_pred = soil_model.predict(X_test)
soil_rmse = np.sqrt(np.mean((ys_test - ys_pred)**2))
soil_r2 = 1 - (np.sum((ys_test - ys_pred)**2) / np.sum((ys_test - np.mean(ys_test))**2))
print(f"  ✓ Soil Moisture: RMSE={soil_rmse:.2f}, R²={soil_r2:.4f}")

# ============================================================================
# PREPARE TIME SERIES DATA
# ============================================================================
print("\n[4] Preparing time-indexed predictions...")

# Get node_1 data
node1_df = df[df['node_id'] == 'node_1'].reset_index(drop=True)

# Get the time indices for test set
test_time_indices = [indices[i] for i in test_idx]
test_times = node1_df['created_at'].iloc[test_time_indices].values
test_actual_temps = yt_test
test_actual_hums = yh_test
test_actual_soils = ys_test
test_pred_temps = yt_pred
test_pred_hums = yh_pred
test_pred_soils = ys_pred

# Convert to pandas for easier handling
pred_df = pd.DataFrame({
    'timestamp': test_times,
    'actual_temp': test_actual_temps,
    'pred_temp': test_pred_temps,
    'actual_hum': test_actual_hums,
    'pred_hum': test_pred_hums,
    'actual_soil': test_actual_soils,
    'pred_soil': test_pred_soils,
})

pred_df['timestamp'] = pd.to_datetime(pred_df['timestamp'])
pred_df = pred_df.sort_values('timestamp').reset_index(drop=True)

print(f"✓ Prepared {len(pred_df)} predictions with timestamps")

# ============================================================================
# FIGURE 4.6: TEMPERATURE PREDICTION VS. ACTUAL
# ============================================================================
print("\n[5] Generating Figure 4.6: Temperature Predictions...")

fig, ax = plt.subplots(figsize=(14, 6))

ax.plot(pred_df['timestamp'], pred_df['actual_temp'], 
        label='Actual Sensor Data', linewidth=2.5, color='#2E86AB', marker='o', markersize=4, alpha=0.8)
ax.plot(pred_df['timestamp'], pred_df['pred_temp'], 
        label='XGBoost Predictions', linewidth=2.5, color='#A23B72', marker='s', markersize=4, alpha=0.8, linestyle='--')

ax.set_xlabel('Time (UTC)', fontsize=12, fontweight='bold')
ax.set_ylabel('Temperature (°C)', fontsize=12, fontweight='bold')
ax.set_title('Figure 4.6: Temperature Prediction vs. Actual Readings\n(1-Hour Forecast Horizon - November Data)', 
             fontsize=14, fontweight='bold', pad=20)
ax.legend(fontsize=11, loc='best', framealpha=0.95)
ax.grid(True, alpha=0.3, linestyle='--')

# Format x-axis
ax.xaxis.set_major_locator(mdates.HourLocator(interval=6))
ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M'))
plt.xticks(rotation=45, ha='right')

# Add statistics box
stats_text = f'RMSE: {temp_rmse:.4f}°C\nR² Score: {temp_r2:.4f}\nSamples: {len(pred_df):,}'
ax.text(0.02, 0.98, stats_text, transform=ax.transAxes, fontsize=10,
        verticalalignment='top', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))

plt.tight_layout()
plt.savefig('Figure_4.6_Temperature_Prediction_vs_Actual_1H_Nov.png', dpi=300, bbox_inches='tight')
print("✓ Saved: Figure_4.6_Temperature_Prediction_vs_Actual_1H_Nov.png")
plt.close()

# ============================================================================
# FIGURE 4.7: HUMIDITY PREDICTION VS. ACTUAL
# ============================================================================
print("\n[6] Generating Figure 4.7: Humidity Predictions...")

fig, ax = plt.subplots(figsize=(14, 6))

ax.plot(pred_df['timestamp'], pred_df['actual_hum'], 
        label='Actual Sensor Data', linewidth=2.5, color='#2E86AB', marker='o', markersize=4, alpha=0.8)
ax.plot(pred_df['timestamp'], pred_df['pred_hum'], 
        label='XGBoost Predictions', linewidth=2.5, color='#A23B72', marker='s', markersize=4, alpha=0.8, linestyle='--')

ax.set_xlabel('Time (UTC)', fontsize=12, fontweight='bold')
ax.set_ylabel('Humidity (%)', fontsize=12, fontweight='bold')
ax.set_title('Figure 4.7: Humidity Prediction vs. Actual Readings\n(1-Hour Forecast Horizon - November Data)', 
             fontsize=14, fontweight='bold', pad=20)
ax.legend(fontsize=11, loc='best', framealpha=0.95)
ax.grid(True, alpha=0.3, linestyle='--')

# Format x-axis
ax.xaxis.set_major_locator(mdates.HourLocator(interval=6))
ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M'))
plt.xticks(rotation=45, ha='right')

# Add statistics box
stats_text = f'RMSE: {hum_rmse:.4f}%\nR² Score: {hum_r2:.4f}\nSamples: {len(pred_df):,}'
ax.text(0.02, 0.98, stats_text, transform=ax.transAxes, fontsize=10,
        verticalalignment='top', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))

# Set y-axis limits for humidity (0-100)
ax.set_ylim([0, 100])

plt.tight_layout()
plt.savefig('Figure_4.7_Humidity_Prediction_vs_Actual_1H_Nov.png', dpi=300, bbox_inches='tight')
print("✓ Saved: Figure_4.7_Humidity_Prediction_vs_Actual_1H_Nov.png")
plt.close()

# ============================================================================
# FIGURE 4.8: SOIL MOISTURE PREDICTION VS. ACTUAL
# ============================================================================
print("\n[7] Generating Figure 4.8: Soil Moisture Predictions...")

fig, ax = plt.subplots(figsize=(14, 6))

ax.plot(pred_df['timestamp'], pred_df['actual_soil'], 
        label='Actual Sensor Data', linewidth=2.5, color='#2E86AB', marker='o', markersize=4, alpha=0.8)
ax.plot(pred_df['timestamp'], pred_df['pred_soil'], 
        label='XGBoost Predictions', linewidth=2.5, color='#A23B72', marker='s', markersize=4, alpha=0.8, linestyle='--')

ax.set_xlabel('Time (UTC)', fontsize=12, fontweight='bold')
ax.set_ylabel('Soil Moisture (Arbitrary Units)', fontsize=12, fontweight='bold')
ax.set_title('Figure 4.8: Soil Moisture Prediction vs. Actual Readings\n(1-Hour Forecast Horizon - November Data)', 
             fontsize=14, fontweight='bold', pad=20)
ax.legend(fontsize=11, loc='best', framealpha=0.95)
ax.grid(True, alpha=0.3, linestyle='--')

# Format x-axis
ax.xaxis.set_major_locator(mdates.HourLocator(interval=6))
ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M'))
plt.xticks(rotation=45, ha='right')

# Add statistics box
stats_text = f'RMSE: {soil_rmse:.2f}\nR² Score: {soil_r2:.4f}\nSamples: {len(pred_df):,}'
ax.text(0.02, 0.98, stats_text, transform=ax.transAxes, fontsize=10,
        verticalalignment='top', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))

plt.tight_layout()
plt.savefig('Figure_4.8_Soil_Moisture_Prediction_vs_Actual_1H_Nov.png', dpi=300, bbox_inches='tight')
print("✓ Saved: Figure_4.8_Soil_Moisture_Prediction_vs_Actual_1H_Nov.png")
plt.close()

# ============================================================================
# GENERATE COMBINED SUMMARY FIGURE
# ============================================================================
print("\n[8] Generating Combined Summary Figure...")

fig, axes = plt.subplots(3, 1, figsize=(14, 12))

# Temperature
axes[0].plot(pred_df['timestamp'], pred_df['actual_temp'], 
            label='Actual Data', linewidth=2, color='#2E86AB', marker='o', markersize=3, alpha=0.8)
axes[0].plot(pred_df['timestamp'], pred_df['pred_temp'], 
            label='XGBoost Predictions', linewidth=2, color='#A23B72', marker='s', markersize=3, alpha=0.8, linestyle='--')
axes[0].set_ylabel('Temperature (°C)', fontsize=11, fontweight='bold')
axes[0].set_title('Figure 4.6: Temperature Predictions (RMSE: {:.4f}°C, R²: {:.4f})'.format(temp_rmse, temp_r2), 
                 fontsize=12, fontweight='bold')
axes[0].legend(fontsize=10, loc='best')
axes[0].grid(True, alpha=0.3, linestyle='--')

# Humidity
axes[1].plot(pred_df['timestamp'], pred_df['actual_hum'], 
            label='Actual Data', linewidth=2, color='#2E86AB', marker='o', markersize=3, alpha=0.8)
axes[1].plot(pred_df['timestamp'], pred_df['pred_hum'], 
            label='XGBoost Predictions', linewidth=2, color='#A23B72', marker='s', markersize=3, alpha=0.8, linestyle='--')
axes[1].set_ylabel('Humidity (%)', fontsize=11, fontweight='bold')
axes[1].set_title('Figure 4.7: Humidity Predictions (RMSE: {:.4f}%, R²: {:.4f})'.format(hum_rmse, hum_r2), 
                 fontsize=12, fontweight='bold')
axes[1].set_ylim([0, 100])
axes[1].legend(fontsize=10, loc='best')
axes[1].grid(True, alpha=0.3, linestyle='--')

# Soil Moisture
axes[2].plot(pred_df['timestamp'], pred_df['actual_soil'], 
            label='Actual Data', linewidth=2, color='#2E86AB', marker='o', markersize=3, alpha=0.8)
axes[2].plot(pred_df['timestamp'], pred_df['pred_soil'], 
            label='XGBoost Predictions', linewidth=2, color='#A23B72', marker='s', markersize=3, alpha=0.8, linestyle='--')
axes[2].set_xlabel('Time (UTC)', fontsize=11, fontweight='bold')
axes[2].set_ylabel('Soil Moisture (Arb. Units)', fontsize=11, fontweight='bold')
axes[2].set_title('Figure 4.8: Soil Moisture Predictions (RMSE: {:.2f}, R²: {:.4f})'.format(soil_rmse, soil_r2), 
                 fontsize=12, fontweight='bold')
axes[2].legend(fontsize=10, loc='best')
axes[2].grid(True, alpha=0.3, linestyle='--')

# Format x-axis for all subplots
for ax in axes:
    ax.xaxis.set_major_locator(mdates.HourLocator(interval=6))
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%m-%d %H:%M'))

plt.setp(axes[0].get_xticklabels(), visible=False)
plt.setp(axes[1].get_xticklabels(), visible=False)
plt.xticks(rotation=45, ha='right')

plt.suptitle('Figures 4.6-4.8: XGBoost Model Performance - Prediction vs. Actual Readings\n(1-Hour Forecast Horizon - November Data)', 
             fontsize=15, fontweight='bold', y=0.995)
plt.tight_layout()
plt.savefig('Figures_4.6-4.8_Combined_Summary_1H_Nov.png', dpi=300, bbox_inches='tight')
print("✓ Saved: Figures_4.6-4.8_Combined_Summary_1H_Nov.png")
plt.close()

# ============================================================================
# CALCULATE & DISPLAY PERFORMANCE METRICS
# ============================================================================
print("\n" + "="*80)
print("MODEL PERFORMANCE SUMMARY (NOVEMBER DATA - 1H HORIZON)")
print("="*80)

# Temperature metrics
temp_mae = np.mean(np.abs(yt_test - yt_pred))
temp_mape = np.mean(np.abs((yt_test - yt_pred) / yt_test)) * 100

# Humidity metrics
hum_mae = np.mean(np.abs(yh_test - yh_pred))
hum_mape = np.mean(np.abs((yh_test - yh_pred) / (yh_test + 0.001))) * 100

# Soil moisture metrics
soil_mae = np.mean(np.abs(ys_test - ys_pred))
soil_mape = np.mean(np.abs((ys_test - ys_pred) / (ys_test + 0.001))) * 100

print("\n📊 TEMPERATURE PREDICTIONS")
print(f"  RMSE:  {temp_rmse:.4f}°C")
print(f"  MAE:   {temp_mae:.4f}°C")
print(f"  MAPE:  {temp_mape:.2f}%")
print(f"  R²:    {temp_r2:.4f}")

print("\n📊 HUMIDITY PREDICTIONS")
print(f"  RMSE:  {hum_rmse:.4f}%")
print(f"  MAE:   {hum_mae:.4f}%")
print(f"  MAPE:  {hum_mape:.2f}%")
print(f"  R²:    {hum_r2:.4f}")

print("\n📊 SOIL MOISTURE PREDICTIONS")
print(f"  RMSE:  {soil_rmse:.2f}")
print(f"  MAE:   {soil_mae:.2f}")
print(f"  MAPE:  {soil_mape:.2f}%")
print(f"  R²:    {soil_r2:.4f}")

# ============================================================================
# SAVE DETAILED RESULTS
# ============================================================================
print("\n[9] Saving detailed results...")

# Export predictions to CSV
export_df = pred_df.copy()
export_df.columns = ['Timestamp', 'Actual_Temperature_C', 'Predicted_Temperature_C',
                     'Actual_Humidity_Pct', 'Predicted_Humidity_Pct',
                     'Actual_Soil_Moisture', 'Predicted_Soil_Moisture']

# Add error columns
export_df['Temp_Error_C'] = export_df['Actual_Temperature_C'] - export_df['Predicted_Temperature_C']
export_df['Humidity_Error_Pct'] = export_df['Actual_Humidity_Pct'] - export_df['Predicted_Humidity_Pct']
export_df['Soil_Moisture_Error'] = export_df['Actual_Soil_Moisture'] - export_df['Predicted_Soil_Moisture']

export_df.to_csv('prediction_results_1H_Nov.csv', index=False)
print("✓ Saved: prediction_results_1H_Nov.csv")

# Save metrics summary
metrics_summary = {
    'forecast_horizon_hours': 1,
    'data_source': 'November 2025',
    'test_samples': int(len(pred_df)),
    'temperature': {
        'rmse': float(temp_rmse),
        'mae': float(temp_mae),
        'mape': float(temp_mape),
        'r2': float(temp_r2),
        'unit': 'celsius'
    },
    'humidity': {
        'rmse': float(hum_rmse),
        'mae': float(hum_mae),
        'mape': float(hum_mape),
        'r2': float(hum_r2),
        'unit': 'percent'
    },
    'soil_moisture': {
        'rmse': float(soil_rmse),
        'mae': float(soil_mae),
        'mape': float(soil_mape),
        'r2': float(soil_r2),
        'unit': 'arbitrary'
    }
}

import json
with open('prediction_metrics_1H_Nov.json', 'w') as f:
    json.dump(metrics_summary, f, indent=2)
print("✓ Saved: prediction_metrics_1H_Nov.json")

print("\n" + "="*80)
print("✓ VISUALIZATION GENERATION COMPLETE (NOVEMBER DATA)")
print("="*80)
print("\nGenerated Files:")
print("  • Figure_4.6_Temperature_Prediction_vs_Actual_1H_Nov.png")
print("  • Figure_4.7_Humidity_Prediction_vs_Actual_1H_Nov.png")
print("  • Figure_4.8_Soil_Moisture_Prediction_vs_Actual_1H_Nov.png")
print("  • Figures_4.6-4.8_Combined_Summary_1H_Nov.png")
print("  • prediction_results_1H_Nov.csv")
print("  • prediction_metrics_1H_Nov.json")
print("\n" + "="*80 + "\n")
