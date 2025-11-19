import { Routes, Route, Link } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";

import HomePage from "./pages/HomePage";
import StarsPage from "./pages/StarsPage.tsx";
import StarDetailPage from "./pages/StarDetailPage";

export default function App() {
  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Расчёт углов наведения стационарного телескопа
          </Navbar.Brand>

          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Главная</Nav.Link>
              <Nav.Link as={Link} to="/stars">Звёзды</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Основное содержимое */}
      <Container className="mt-5 pt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stars" element={<StarsPage />} />
          <Route path="/stars/:id" element={<StarDetailPage />} />

          <Route path="*" element={<h2>Страница не найдена</h2>} />
        </Routes>
      </Container>
    </>
  );
}
