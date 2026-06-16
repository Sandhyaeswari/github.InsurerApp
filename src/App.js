import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { isAuthenticated } from "./auth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login — redirect to dashboard if already signed in */}
        <Route
          path="/"
          element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        {/* Dashboard — requires authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
