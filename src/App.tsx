import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './lib/store';

import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/layout/AdminLayout';
import { Home } from './pages/Home';
import { Tournaments } from './pages/Tournaments';
import { TournamentDetail } from './pages/TournamentDetail';
import { Leaderboard } from './pages/Leaderboard';
import { Profile } from './pages/Profile';
import { Wallet } from './pages/Wallet';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { MyTournaments } from './pages/MyTournaments';
import { Schedule } from './pages/Schedule';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminTournaments } from './pages/admin/Tournaments';
import { AdminUsers } from './pages/admin/Users';
import { AdminTransactions } from './pages/admin/Transactions';

function App() {
  const { initializeRealtime, initializeAuth } = useStore();

  useEffect(() => {
    initializeAuth();
    initializeRealtime();
  }, [initializeRealtime, initializeAuth]);

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground font-sans antialiased">
        <Routes>
          {/* User Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/:id" element={<TournamentDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/my-tournaments" element={<MyTournaments />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/schedule" element={<Schedule />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="tournaments" element={<AdminTournaments />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="transactions" element={<AdminTransactions />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
