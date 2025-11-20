# Implementation Plan - Smart Travel Planner (Wanderlust)

## Goal Description

Build a high-quality, feature-rich **Smart Travel Planner** web application. The app will allow users to plan trips visually using an interactive map, manage daily itineraries, track budgets, and view weather forecasts. The focus is on a premium user interface ("Wow" factor) and "Smart" features that add value without excessive complexity.

## User Review Required

> [!IMPORTANT] > **Data Persistence**: We will use `LocalStorage` to save data. This ensures the app works instantly without a backend setup, perfect for a quick but impressive demo.

### Tech Stack

- **Framework**: React (Vite) + **TypeScript**
- **Styling**: Tailwind CSS (Custom design system for premium look)
- **Map**: React-Leaflet + Leaflet
- **State Management**: Zustand (Lightweight, fast)
- **Icons**: Lucide-React
- **Charts**: Recharts (For budget visualization)
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable (For Itinerary & Kanban)
- **Utilities**: date-fns (Date handling), clsx/tailwind-merge

### Architecture

The app will be a Single Page Application (SPA) with a Dashboard view and a Trip Detail view.

#### [NEW] Project Structure

- `src/components`: Reusable UI components (Buttons, Cards, Inputs).
- `src/features`: Feature-specific components (Map, Itinerary, Budget, Kanban).
- `src/store`: Zustand stores for application state.
- `src/hooks`: Custom hooks for logic (useWeather, useLocalStorage).
- `src/types`: TypeScript definitions.

### Features Breakdown

#### 1. Dashboard & Trip Management

- **Trip Cards**: Display upcoming trips with cover images and countdowns.
- **Create Trip Modal**: Input destination, dates, and budget goal.

#### 2. Interactive Map (The "Core")

- **Map View**: Full-screen or Split-screen map.
- **Search**: Search bar to find locations (Hotels, Attractions).
- **Markers**: Click to add markers to the map and itinerary.

#### 3. Smart Itinerary

- **Timeline View**: Vertical timeline of daily activities.
- **Drag & Drop**: Reorder activities within a day or move between days.
- **Time Management**: Auto-calculate travel times (mocked or simple distance-based).

#### 4. [NEW] Trip Kanban Board (Task Management)

- **Jira-style Board**: A dedicated tab for managing trip-related tasks (e.g., "Book Flight", "Renew Passport").
- **Columns**: Default columns (To Do, In Progress, Done) + Ability to add custom columns.
- **Rich Cards**: Task cards with:
  - Priority Tags (High/Medium/Low)
  - Due Dates
  - Assignee (Mocked for solo project, but good for UI)
  - Subtasks checklist
- **Drag & Drop**: Smooth drag and drop between columns using `@dnd-kit`.

#### 5. Smart Widgets

- **Weather Forecast**: Show predicted weather for the specific trip dates and location.
- **Budget Tracker**: Visual breakdown of expenses (Accommodation, Food, Transport) vs Budget Limit.
- **Packing List**: Auto-generated checklist based on destination type (e.g., "Beach" -> Sunscreen, Swimsuit).

## Verification Plan

### Automated Tests

- We will focus on manual verification for this UI-heavy project.

### Manual Verification

- **Flow 1**: Create a new trip to "Da Nang" for next weekend.
- **Flow 2**: Search for "Dragon Bridge" on the map and add it to Day 1.
- **Flow 3**: Check if the Weather widget shows the forecast for Da Nang.
- **Flow 4**: Add an expense of 500k VND for "Dinner" and verify the Budget Chart updates.
- **Flow 5**: Refresh the page and ensure data persists.
