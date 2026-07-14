import LoginPage from './pages/LoginPage';
import CheckinPage from './pages/CheckinPage';
import GamesPage from './pages/GamesPage';
import FoodPage from './pages/FoodPage';
import SessionSummaryPage from './pages/SessionSummaryPage';

function App() {
  const path = window.location.pathname;

  if (path === '/checkin') return <CheckinPage />;
  if (path === '/games') return <GamesPage />;
  if (path === '/food') return <FoodPage />;
  if (path === '/summary') return <SessionSummaryPage />;

  return <LoginPage />;
}

export default App;