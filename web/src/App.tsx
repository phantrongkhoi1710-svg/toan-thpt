import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { SlidesPage } from "./pages/SlidesPage";
import { ChallengePage } from "./pages/ChallengePage";
import { LoginPage } from "./pages/LoginPage";
import { AdminPage } from "./pages/AdminPage";
import { TeacherStudioPage } from "./pages/TeacherStudioPage";
import { RequireAuth } from "./components/RequireAuth";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        }
      />
      <Route path="/dang-nhap" element={<LoginPage />} />
      <Route
        path="/quan-tri"
        element={
          <RequireAuth teacherOnly>
            <AdminPage />
          </RequireAuth>
        }
      />
      <Route
        path="/soan-bai"
        element={
          <RequireAuth teacherOnly>
            <TeacherStudioPage />
          </RequireAuth>
        }
      />
      <Route
        path="/bai/:slug/slides"
        element={
          <RequireAuth>
            <SlidesPage />
          </RequireAuth>
        }
      />
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
