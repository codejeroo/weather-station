"""
Flask API Backend for Extended Horizon ML Predictions
Runs predictions hourly and saves results to Supabase
"""

import os
import json
import logging
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
import pandas as pd
import numpy as np
from supabase import create_client, Client
from predict_extended_horizon import ExtendedHorizonPredictor

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase_url = os.getenv('VITE_SUPABASE_URL')
supabase_key = os.getenv('VITE_SUPABASE_ANON_KEY')

if not supabase_url or not supabase_key:
    logger.error("Missing Supabase credentials in .env")
else:
    supabase: Client = create_client(supabase_url, supabase_key)
    logger.info("✓ Supabase client initialized")

# Initialize predictor
try:
    predictor = ExtendedHorizonPredictor('extended_horizon_models.pkl')
    logger.info("✓ ML model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load ML model: {e}")
    predictor = None

# Global state
last_prediction = None
last_prediction_time = None


def fetch_recent_sensor_data(hours=4):
    """Fetch recent sensor data from Supabase for predictions"""
    try:
        threshold = datetime.utcnow() - timedelta(hours=hours)
        threshold_iso = threshold.isoformat()
        
        response = supabase.table('sensor_logs').select('*').gte(
            'created_at', threshold_iso
        ).order('created_at', desc=False).execute()
        
        if not response.data:
            logger.warning("No sensor data found for predictions")
            return None
        
        df = pd.DataFrame(response.data)
        df['created_at'] = pd.to_datetime(df['created_at'])
        
        logger.info(f"✓ Fetched {len(df)} sensor records for prediction")
        return df
    except Exception as e:
        logger.error(f"Error fetching sensor data: {e}")
        return None


def save_predictions_to_db(predictions, node_id='node_1'):
    """Save predictions to Supabase"""
    try:
        if not predictions:
            logger.warning("No predictions to save")
            return False
        
        prediction_record = {
            'node_id': node_id,
            'prediction_time': datetime.utcnow().isoformat(),
            'predictions': json.dumps(predictions),
            'created_at': datetime.utcnow().isoformat()
        }
        
        response = supabase.table('predictions').insert(prediction_record).execute()
        
        logger.info(f"✓ Predictions saved to database")
        return True
    except Exception as e:
        logger.error(f"Error saving predictions: {e}")
        return False


def run_hourly_prediction():
    """Run predictions every hour"""
    global last_prediction, last_prediction_time
    
    try:
        if not predictor or not predictor.ready:
            logger.error("Predictor not ready")
            return
        
        logger.info("🔄 Running hourly prediction task...")
        
        df = fetch_recent_sensor_data(hours=4)
        if df is None or len(df) < 12:
            logger.warning("Insufficient data for prediction")
            return
        
        predictions = predictor.predict_sequence(
            df,
            horizons_list=['1h', '4h', '6h', '12h'],
            node_id='node_1'
        )
        
        if not predictions:
            logger.error("Prediction failed")
            return
        
        last_prediction = predictions
        last_prediction_time = datetime.utcnow()
        
        save_predictions_to_db(predictions, 'node_1')
        
        logger.info("✓ Prediction task completed successfully")
        
    except Exception as e:
        logger.error(f"Error in prediction task: {e}")


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'predictor_ready': predictor.ready if predictor else False
    }), 200


@app.route('/predict', methods=['GET'])
def get_latest_prediction():
    """Get latest prediction"""
    if last_prediction is None:
        return jsonify({
            'status': 'no_prediction',
            'message': 'No predictions available yet'
        }), 404
    
    return jsonify({
        'status': 'success',
        'prediction_time': last_prediction_time.isoformat(),
        'predictions': last_prediction
    }), 200


@app.route('/predict-now', methods=['POST'])
def predict_now():
    """Trigger prediction immediately"""
    try:
        if not predictor or not predictor.ready:
            return jsonify({'error': 'Predictor not ready'}), 500
        
        df = fetch_recent_sensor_data(hours=4)
        if df is None or len(df) < 12:
            return jsonify({'error': 'Insufficient sensor data'}), 400
        
        predictions = predictor.predict_sequence(
            df,
            horizons_list=['1h', '4h', '6h', '12h'],
            node_id='node_1'
        )
        
        save_predictions_to_db(predictions, 'node_1')
        
        return jsonify({
            'status': 'success',
            'prediction_time': datetime.utcnow().isoformat(),
            'predictions': predictions
        }), 200
    except Exception as e:
        logger.error(f"Error in predict_now: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/predictions/<horizon>', methods=['GET'])
def get_prediction_by_horizon(horizon):
    """Get prediction for specific horizon (1h, 4h, 6h, 12h)"""
    if last_prediction is None:
        return jsonify({'error': 'No predictions available'}), 404
    
    for pred in last_prediction:
        if pred['horizon'] == horizon:
            return jsonify({
                'status': 'success',
                'prediction_time': last_prediction_time.isoformat(),
                'prediction': pred
            }), 200
    
    return jsonify({'error': f'Horizon {horizon} not found'}), 404


@app.route('/stats', methods=['GET'])
def get_stats():
    """Get API statistics"""
    return jsonify({
        'status': 'success',
        'last_prediction_time': last_prediction_time.isoformat() if last_prediction_time else None,
        'predictor_ready': predictor.ready if predictor else False,
        'supported_horizons': ['1h', '4h', '6h', '12h'],
        'update_interval': 'Every hour'
    }), 200


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal error: {error}")
    return jsonify({'error': 'Internal server error'}), 500


def start_scheduler():
    """Start background scheduler for hourly predictions"""
    scheduler = BackgroundScheduler()
    
    scheduler.add_job(
        func=run_hourly_prediction,
        trigger='interval',
        hours=1,
        id='hourly_prediction',
        name='Hourly ML Prediction',
        replace_existing=True
    )
    
    scheduler.add_job(
        func=run_hourly_prediction,
        trigger='date',
        id='startup_prediction',
        name='Startup Prediction',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("✓ Scheduler started - Predictions will run hourly")


if __name__ == '__main__':
    start_scheduler()
    
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'production') == 'development'
    
    logger.info(f"🚀 Starting Flask API on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)