// Define el enrutado principal de la app dentro del layout global.
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { BookDetailPage } from "./pages/BookDetailPage";
import { EditBookPage } from "./pages/EditBookPage";
import { LibraryPage } from "./pages/LibraryPage";
import { NewBookPage } from "./pages/NewBookPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LibraryPage />} />
        <Route path="/books/new" element={<NewBookPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/books/:id/edit" element={<EditBookPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
