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

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  coverImage?: string;
  budget: number;
  coordinates?: { lat: number; lng: number }; // Optional coordinates for accurate weather
  days: TripDay[];
  tasks: TripTask[];
  expenses: {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
  }[];
  packingList: PackingItem[];
  photos?: Photo[];
  weather?: {
    date: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
    precipitationProbability: number;
  }[];
}

export interface UserSettings {
  currency: string;
  theme: "light" | "dark";
}
