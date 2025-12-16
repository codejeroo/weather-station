module.exports = {
  apps: [
    {
      name: 'ml-predictions',
      script: 'app.py',
      interpreter: 'python3',
      env: {
        FLASK_ENV: 'production',
        PORT: 5000
      },
      watch: false,
      ignore_watch: ['node_modules', 'venv', '__pycache__'],
      log_file: './logs/ml-api.log',
      error_file: './logs/ml-api-error.log',
      out_file: './logs/ml-api-out.log'
    },
    {
      name: 'email-bot',
      script: 'emailBot.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      watch: false,
      log_file: './logs/email-bot.log',
      error_file: './logs/email-bot-error.log',
      out_file: './logs/email-bot-out.log'
    }
  ]
};