# 🌍 Wanderlust Planner

A modern, smart travel planning application built to help you organize your trips with ease. Visualize your itinerary on an interactive map, manage tasks with a Kanban board, track your budget, and more.

## ✨ Key Features

- **🗺️ Interactive Map**: Integrated Leaflet map to visualize your destinations and activities.
- **📅 Itinerary Management**: Drag-and-drop interface to plan your daily activities.
- **✅ Trip Kanban Board**: Jira-style task management for pre-trip to-dos (e.g., "Book flights", "Renew passport").
- **💰 Budget Tracker**: Keep track of expenses with visual charts and category breakdowns.
- **🌤️ Weather Widget**: Get real-time weather forecasts for your trip dates and locations.
- **🧳 Smart Packing List**: Generate personalized packing lists based on destination, weather, and duration.
- **📸 Photo Gallery**: (Coming Soon) Store and organize your trip memories.

## 🛠️ Tech Stack

- **Core**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [clsx](https://github.com/lukeed/clsx), [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Maps**: [React Leaflet](https://react-leaflet.js.org/), [Leaflet](https://leafletjs.com/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/wanderlust-planner.git
   cd wanderlust-planner
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## 📂 Project Structure

```
src/
├── api/            # API integration (Weather, Geocoding)
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── store/          # Global state (Zustand stores)
├── types/          # TypeScript definitions
├── utils/          # Helper functions
└── App.tsx         # Main application entry
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
