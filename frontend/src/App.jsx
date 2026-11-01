import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import ProtectedRoute from './components/ProtectedRoute';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Payroll from './pages/Payroll';
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
  path="/payroll"
  element={
    <ProtectedRoute>
      <Payroll />
    </ProtectedRoute>
  }
/>
      <Route
  path="/leaves"
  element={
    <ProtectedRoute>
      <Leaves />
    </ProtectedRoute>
  }
/>
      <Route
  path="/attendance"
  element={
    <ProtectedRoute>
      <Attendance />
    </ProtectedRoute>
  }
/>
      <Route
  path="/employees"
  element={
    <ProtectedRoute>
      <Employees />
    </ProtectedRoute>
  }
/>
      <Route path="/" element={<Landing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;