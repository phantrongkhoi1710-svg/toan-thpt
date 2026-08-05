import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { SlidesPage } from "./pages/SlidesPage";
import { ChallengePage } from "./pages/ChallengePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/bai/:slug/slides" element={<SlidesPage />} />
      <Route path="/bai/:slug/challenge" element={<ChallengePage />} />
      <Route path="/bai/:slug/bai-tap" element={<ChallengePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
