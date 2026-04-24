// Define el enrutado principal de la app dentro del layout global.
import { Location as RouterLocation, Route, Routes, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { EditBookPage } from "./pages/EditBookPage";
import { LibraryPage } from "./pages/LibraryPage";
import { LoginPage } from "./pages/LoginPage";
import { NewBookPage } from "./pages/NewBookPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { WishlistPage } from "./pages/WishlistPage";

const ReadingHistoryPage = lazy(() =>
  import("./pages/ReadingHistoryPage").then((module) => ({ default: module.ReadingHistoryPage }))
);
const StatisticsPage = lazy(() =>
  import("./pages/StatisticsPage").then((module) => ({ default: module.StatisticsPage }))
);

function App() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: RouterLocation } | null;

  return (
    <Layout>
      <Routes location={state?.backgroundLocation ?? location}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <LibraryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="px-4 py-3 text-amber-100">Cargando historial...</div>}>
                <ReadingHistoryPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <ReviewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="px-4 py-3 text-amber-100">Cargando estadísticas...</div>}>
                <StatisticsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/new"
          element={
            <ProtectedRoute>
              <NewBookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/:id/edit"
          element={
            <ProtectedRoute>
              <EditBookPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {state?.backgroundLocation && (
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </Layout>
  );
}

export default App;
