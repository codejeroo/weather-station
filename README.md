# MicroClimate.AI (Vite + React)

An advanced climate monitoring and analysis platform built with Vite + React. MicroClimate.AI provides real-time climate data, weather patterns, and environmental insights for Butuan City.

## Features

- **Interactive Dashboard**: Real-time climate monitoring with charts and analytics
- **AI-Powered Chatbot**: Ask questions about climate data and weather patterns
- **Location Mapping**: Interactive map showing monitoring station location
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Theme**: Customizable user interface

## Tech Stack

- **Frontend**: React 18 with Vite
- **Charts**: Recharts for data visualization
- **Maps**: Leaflet with OpenStreetMap integration
- **Styling**: CSS with custom variables for theming
- **AI Integration**: OpenRouter API for intelligent conversations

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd weather-station

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── pages/        # Page components
├── styles.css        # Global styles and themes
└── main.jsx         # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
