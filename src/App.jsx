import LoginPage from './pages/LoginPage';
import CheckinPage from './pages/CheckinPage';
import GamesPage from './pages/GamesPage';
import FoodPage from './pages/FoodPage';
import SessionSummaryPage from './pages/SessionSummaryPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import StaffKitchenPage from './pages/StaffKitchenPage';
import StaffInventoryPage from './pages/StaffInventoryPage';
import StaffFoodInventoryPage from './pages/StaffFoodInventoryPage';

function App() {
  const path = window.location.pathname;

  if (path === '/checkin') return <CheckinPage />;
  if (path === '/games') return <GamesPage />;
  if (path === '/food') return <FoodPage />;
  if (path === '/summary') return <SessionSummaryPage />;
  if (path === '/staff') return <StaffDashboardPage />;
  if (path === '/staff/kitchen') return <StaffKitchenPage />;
  if (path === '/staff/inventory') return <StaffInventoryPage />;
  if (path === '/staff/food-inventory') return <StaffFoodInventoryPage />;

  return <LoginPage />;
}

export default App;