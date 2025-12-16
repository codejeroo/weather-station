"""
Extended Horizon Weather Predictor
Uses multi-horizon XGBoost models (1h, 4h, 6h, 12h)
with uncertainty quantification for robust forecasting
"""

import pickle
import numpy as np
import pandas as pd
from datetime import timedelta

class ExtendedHorizonPredictor:
    """Advanced multi-horizon weather predictor with uncertainty bands"""
    
    def __init__(self, model_path='extended_horizon_models.pkl'):
        try:
            with open(model_path, 'rb') as f:
                data = pickle.load(f)
            self.models = data['models']
            self.quantile_models = data['quantile_models']
            self.horizons = data['horizons']
            self.ready = True
            print("✓ Extended horizon models loaded successfully")
        except Exception as e:
            self.ready = False
            print(f"Error loading models: {e}")
    
    def _make_features(self, df, index, node_id='node_1'):
        """
        Create comprehensive feature vector from sensor data
        
        Args:
            df: DataFrame with sensor data
            index: Current row index
            node_id: Node identifier ('node_1' or 'node_2')
        
        Returns:
            Feature vector (30 features)
        """
        # Windows
        window_30 = df.iloc[max(0, index-6):index]           # Last 30 min
        window_1h = df.iloc[max(0, index-12):index]          # Last 1 hour
        window_2h = df.iloc[max(0, index-24):index]          # Last 2 hours
        window_4h = df.iloc[max(0, index-48):index]          # Last 4 hours
        
        # Temperature features
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
        
        # Humidity features
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
        
        # Pressure features
        pressure_mean = window_4h['pressure'].mean()
        pressure_std = window_4h['pressure'].std() or 0
        pressure_trend = window_1h['pressure'].iloc[-1] - window_1h['pressure'].iloc[0]
        
        # Soil moisture features
        soil_mean = window_4h['soil_moisture'].mean()
        soil_std = window_4h['soil_moisture'].std() or 0
        
        # Time-of-day feature (sin/cos encoding)
        hour_of_day = pd.to_datetime(df['created_at'].iloc[index]).hour
        hour_sin = np.sin(2 * np.pi * hour_of_day / 24)
        hour_cos = np.cos(2 * np.pi * hour_of_day / 24)
        
        # Node identifier
        node_code = 1 if node_id == 'node_2' else 0
        
        # Assemble feature vector
        features = np.array([[
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
            df['altitude'].iloc[index],
            hour_sin, hour_cos,
            node_code,
        ]])
        
        return features
    
    def predict(self, df, horizon='4h', node_id='node_1'):
        """
        Generate forecast for specified horizon
        
        Args:
            df: DataFrame with recent sensor data (last 4+ hours)
            horizon: '1h', '4h', '6h', or '12h'
            node_id: Node identifier
        
        Returns:
            Dict with predictions and uncertainty intervals
        """
        if not self.ready:
            return None
        
        if horizon not in self.horizons:
            print(f"Invalid horizon. Options: {list(self.horizons.keys())}")
            return None
        
        # Get last valid row
        last_idx = len(df) - 1
        
        # Create features
        features = self._make_features(df, last_idx, node_id)
        
        # Get models
        horizon_models = self.models[horizon]
        scaler = horizon_models['scaler']
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Make predictions
        temp_pred = horizon_models['temp'].predict(features_scaled)[0]
        hum_pred = horizon_models['hum'].predict(features_scaled)[0]
        soil_pred = horizon_models['soil'].predict(features_scaled)[0]
        
        # Get uncertainty intervals for temperature
        q10_pred = self.quantile_models[horizon]['q10'].predict(features_scaled)[0]
        q90_pred = self.quantile_models[horizon]['q90'].predict(features_scaled)[0]
        
        # Calculate forecast time
        current_time = pd.to_datetime(df['created_at'].iloc[-1])
        forecast_steps = self.horizons[horizon]
        forecast_time = current_time + timedelta(minutes=forecast_steps * 5)
        
        return {
            'horizon': horizon,
            'forecast_time': forecast_time,
            'current_time': current_time,
            'minutes_ahead': forecast_steps * 5,
            'temperature': {
                'value': float(temp_pred),
                'lower_bound': float(q10_pred),
                'upper_bound': float(q90_pred),
                'uncertainty': float(q90_pred - q10_pred),
                'unit': '°C'
            },
            'humidity': {
                'value': float(np.clip(hum_pred, 0, 100)),
                'unit': '%'
            },
            'soil_moisture': {
                'value': float(soil_pred),
                'unit': 'arbitrary'
            },
            'confidence': 'High' if horizon in ['1h', '4h'] else 'Moderate' if horizon == '6h' else 'Low',
        }
    
    def predict_sequence(self, df, horizons_list=['1h', '4h', '6h'], node_id='node_1'):
        """
        Generate forecasts for multiple horizons
        
        Args:
            df: DataFrame with recent sensor data
            horizons_list: List of horizon strings
            node_id: Node identifier
        
        Returns:
            List of forecast dictionaries
        """
        results = []
        for horizon in horizons_list:
            pred = self.predict(df, horizon, node_id)
            if pred:
                results.append(pred)
        return results

# Example usage
if __name__ == "__main__":
    # Load sample data
    df = pd.read_csv('sensor_logs.csv')
    df['created_at'] = pd.to_datetime(df['created_at'])
    df = df.sort_values(['node_id', 'created_at']).reset_index(drop=True)
    
    # Initialize predictor
    predictor = ExtendedHorizonPredictor()
    
    if predictor.ready:
        # Get recent data for node_1
        node1_recent = df[df['node_id'] == 'node_1'].tail(50).reset_index(drop=True)
        
        print("\n" + "="*80)
        print("EXTENDED HORIZON WEATHER PREDICTIONS")
        print("="*80)
        print(f"Current time: {node1_recent['created_at'].iloc[-1]}")
        print(f"Current conditions - Temp: {node1_recent['temperature'].iloc[-1]:.1f}°C, "
              f"Humidity: {node1_recent['humidity'].iloc[-1]:.1f}%\n")
        
        # Generate forecasts
        forecasts = predictor.predict_sequence(node1_recent, 
                                             horizons_list=['1h', '4h', '6h', '12h'],
                                             node_id='node_1')
        
        for forecast in forecasts:
            print(f"📊 {forecast['horizon'].upper()} FORECAST ({forecast['minutes_ahead']} minutes ahead)")
            print(f"   Time: {forecast['forecast_time']}")
            print(f"   Temperature: {forecast['temperature']['value']:.2f}°C "
                  f"[{forecast['temperature']['lower_bound']:.2f}°C - "
                  f"{forecast['temperature']['upper_bound']:.2f}°C]")
            print(f"   Humidity: {forecast['humidity']['value']:.1f}%")
            print(f"   Soil Moisture: {forecast['soil_moisture']['value']:.1f}")
            print(f"   Confidence: {forecast['confidence']}\n")
