import { Layout } from "./components/Layout";
import { Dashboard } from "./features/dashboard/Dashboard";
import { useTripStore } from "./store/useTripStore";
import { TripDetails } from "./features/trip/TripDetails";

function App() {
  const { activeTripId } = useTripStore();

  return (
    <Layout>
      {activeTripId ? <TripDetails tripId={activeTripId} /> : <Dashboard />}
    </Layout>
  );
}

export default App;
