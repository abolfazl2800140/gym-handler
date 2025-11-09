import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Navbar";
import Members from "./pages/Members";
import Attendance from "./pages/Attendance";
import Financial from "./pages/Financial";
import Reports from "./pages/Reports";
import AIAssistant from "./pages/AIAssistant";
import ActivityLogs from "./pages/ActivityLogs";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/members" replace />} />
            <Route path="/members" element={<Members />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/financial" element={<Financial />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
