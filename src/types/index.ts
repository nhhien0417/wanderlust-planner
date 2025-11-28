export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "done";

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  type?: "hotel" | "restaurant" | "attraction" | "other";
}

export interface Photo {
  id: string;
  tripId: string;
  activityId?: string; // Optional link to activity
  dayId?: string; // Optional link to day
  fileName: string;
  fileSize: number;
  uploadDate: string;
  captureDate?: string; // When photo was taken
  description?: string;
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
  thumbnailUrl: string; // Data URL for thumbnail
  photoId: number; // IndexedDB key
}

export interface Activity {
  id: string;
  tripId: string;
  dayId: string; // Which day of the trip
  title: string;
  description?: string;
  category: "attraction" | "restaurant" | "hotel" | "transport" | "other";
  location?: Location; // Optional - activities can exist without specific location
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  cost?: number;
  order_index?: number;
}

export interface TripDay {
  id: string;
  date: string; // ISO string
  activities: Activity[];
}

export interface TripTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  assignee?: string;
  subtasks: { id: string; title: string; completed: boolean }[];
}

export interface PackingItem {
  id: string;
  name: string;
  category: string;
  checked: boolean;
  isCustom?: boolean;
}

export interface WeatherData {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  precipitationProbability: number;
  sunrise?: string;
  sunset?: string;
  uvIndexMax?: number;
  windSpeedMax?: number;
  humidityMax?: number;
}

export interface TripMember {
  user_id: string;
  trip_id: string;
  role: "owner" | "editor" | "viewer";
  email?: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface Trip {
  id: string;
  created_by?: string; // UUID of the user who created the trip
  name: string;
  destination: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  coverImage?: string;
  budget: number;
  currency?: string; // ISO currency code (e.g., 'USD', 'EUR', 'VND')
  coordinates?: { lat: number; lng: number }; // Optional coordinates for accurate weather
  days: TripDay[];
  tasks: TripTask[];
  expenses: Expense[];
  packingList: PackingItem[];
  photos?: Photo[];
  weather?: WeatherData[];
  weatherLastUpdated?: string; // ISO string timestamp
  members?: TripMember[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface UserSettings {
  currency: string;
  theme: "light" | "dark";
}
