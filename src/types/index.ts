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

export interface Activity {
  id: string;
  tripId: string;
  dayId: string; // Which day of the trip
  location: Location;
  time?: string;
  notes?: string;
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
  days: TripDay[];
  tasks: TripTask[];
  expenses: {
    id: string;
    category: string;
    amount: number;
    note: string;
    date?: string;
  }[];
  packingList: PackingItem[];
}

export interface UserSettings {
  currency: string;
  theme: "light" | "dark";
}
