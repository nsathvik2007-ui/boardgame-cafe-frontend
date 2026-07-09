import LoginPage from './pages/LoginPage';
import CheckinPage from './pages/CheckinPage';

function App() {
  const path = window.location.pathname;

  if (path === '/checkin') return <CheckinPage />;
  if (path === '/login') return <LoginPage />;
  if (path === '/games') return <div className="p-10 text-center">Games page coming soon</div>;
  if (path === '/food') return <div className="p-10 text-center">Food ordering page coming soon</div>;

  return <LoginPage />;
}

export default App;