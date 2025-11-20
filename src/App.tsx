import { Layout } from "./components/Layout";
import { Dashboard } from "./features/dashboard/Dashboard";
import { useTripStore } from "./store/useTripStore";

// Placeholder for Trip View
const TripView = ({ tripId }: { tripId: string }) => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Trip Details: {tripId}</h1>
      <p>Coming soon...</p>
    </div>
  );
};

function App() {
  const { activeTripId } = useTripStore();

  return (
    <Layout>
      {activeTripId ? <TripView tripId={activeTripId} /> : <Dashboard />}
    </Layout>
  );
}

export default App;
