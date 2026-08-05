import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { SlidesPage } from "./pages/SlidesPage";
import { ChallengePage } from "./pages/ChallengePage";
import { LoginPage } from "./pages/LoginPage";
import { AdminPage } from "./pages/AdminPage";
import { RequireAuth } from "./components/RequireAuth";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dang-nhap" element={<LoginPage />} />
      <Route
        path="/quan-tri"
        element={
          <RequireAuth teacherOnly>
            <AdminPage />
          </RequireAuth>
        }
      />
      <Route path="/bai/:slug/slides" element={<SlidesPage />} />
      <Route
        path="/bai/:slug/challenge"
        element={
          <RequireAuth>
            <ChallengePage />
          </RequireAuth>
        }
      />
      <Route
        path="/bai/:slug/bai-tap"
        element={
          <RequireAuth>
            <ChallengePage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
