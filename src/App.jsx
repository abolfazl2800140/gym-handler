import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import Members from "./pages/Members";
import MemberProfile from "./pages/MemberProfile";
import Attendance from "./pages/Attendance";
import Financial from "./pages/Financial";
import Reports from "./pages/Reports";
import AIAssistant from "./pages/AIAssistant";
import ActivityLogs from "./pages/ActivityLogs";
import { authService } from "./services/auth";
import "./App.css";

function App() {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <BrowserRouter>
      <div className="app">
        {/* فقط وقتی لاگین کرده Sidebar نشون بده */}
        {isAuthenticated && <Sidebar />}
        
        <main className="main-content">
          <Routes>
            {/* صفحه Login */}
            <Route path="/login" element={<Login />} />

            {/* Redirect از صفحه اصلی */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                  <Navigate to="/members" replace /> : 
                  <Navigate to="/login" replace />
              } 
            />

            {/* Protected Routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:id"
              element={
                <ProtectedRoute>
                  <UserDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members"
              element={
                <ProtectedRoute>
                  <Members />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members/:id"
              element={
                <ProtectedRoute>
                  <MemberProfile />
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
              path="/financial"
              element={
                <ProtectedRoute>
                  <Financial />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai"
              element={
                <ProtectedRoute>
                  <AIAssistant />
                </ProtectedRoute>
              }
            />

            {/* Activity Logs - فقط برای Super Admin */}
            <Route
              path="/activity-logs"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <ActivityLogs />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
