import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Users from './pages/Users';
import Clients from './pages/Clients';
import Roles from './pages/Roles';
import Permissions from './pages/Permissions';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="users" element={<Users />} />
        <Route path="clients" element={<Clients />} />
        <Route path="roles" element={<Roles />} />
        <Route path="permissions" element={<Permissions />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
