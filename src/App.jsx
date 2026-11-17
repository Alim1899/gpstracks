import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "@/components/Layout/Layout";
import { HomePage } from "@/components/Features/Trails/Pages/HomePage";
import { LoginPage } from "@/components/Features/Auth/Pages/LoginPage";
import { ProtectedRoute } from "@/components/Features/Auth/ProtectedRoute/ProtectedRoute";
import { RegisterPage } from "./components/Features/Auth/Pages/RegisterPage";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="upload" element={<p>ატვირთვა მალე</p>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
