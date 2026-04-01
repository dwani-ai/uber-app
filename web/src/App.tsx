import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProjectsProvider } from "./ProjectsContext";
import { HomePage } from "./pages/HomePage";
import { ProjectEmbedPage } from "./pages/ProjectEmbedPage";

export default function App() {
  return (
    <ProjectsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/run/:projectId" element={<ProjectEmbedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ProjectsProvider>
  );
}
