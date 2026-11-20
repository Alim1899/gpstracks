import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "@/components/Layout/Layout";
import { ProtectedRoute } from "@/components/Features/Auth/ProtectedRoute/ProtectedRoute";

// გვერდები ცალკე ფაილებად; named export-ს lazy-სთვის default-ად ვაქცევთ
const HomePage = lazy(() =>
  import("@/components/Features/Trails/Pages/HomePage").then((m) => ({ default: m.HomePage }))
);
const LoginPage = lazy(() =>
  import("@/components/Features/Auth/Pages/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import("@/components/Features/Auth/Pages/RegisterPage").then((m) => ({ default: m.RegisterPage }))
);
const UploadPage = lazy(() =>
  import("@/components/Features/Upload/Pages/UploadPage").then((m) => ({ default: m.UploadPage }))
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="upload" element={<UploadPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;