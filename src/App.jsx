import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "@/components/Layout/Layout";
import { ProtectedRoute } from "@/components/Features/Auth/ProtectedRoute/ProtectedRoute";
import { Loader } from "./components/UI/Index";
import { AdminRoute } from "./components/Features/Auth/ProtectedRoute/AdminRoute";
// გვერდები ცალკე ფაილებად; named export-ს lazy-სთვის default-ად ვაქცევთ
const AdminPage = lazy(() =>
  import("@/components/Features/Admin/Pages/AdminPage").then((m) => ({
    default: m.AdminPage,
  })),
);
const HomePage = lazy(() =>
  import("@/components/Features/Trails/Pages/HomePage").then((m) => ({
    default: m.HomePage,
  })),
);
const LoginPage = lazy(() =>
  import("@/components/Features/Auth/Pages/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);
const RegisterPage = lazy(() =>
  import("@/components/Features/Auth/Pages/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  })),
);
const TrailPage = lazy(() =>
  import("@/components/Features/Trails/Pages/TrailPage").then((m) => ({
    default: m.TrailPage,
  })),
);
const UploadPage = lazy(() =>
  import("@/components/Features/Upload/Pages/UploadPage").then((m) => ({
    default: m.UploadPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("@/components/Features/Common/Pages/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  })),
);
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader fullPage />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="trails/:id" element={<TrailPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="upload" element={<UploadPage />} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="admin" element={<AdminPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
