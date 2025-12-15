import { Container, Navbar, Nav, Button, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../store";
import { logoutUserAsync } from "../store/userSlice";

export default function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isAuthenticated, username } = useSelector(
    (state: RootState) => state.user
  );

  const { app_id, count } = useSelector(
    (state: RootState) => state.telescopeObservationDraft
  );

  async function handleExit() {
    await dispatch(logoutUserAsync());
    navigate("/");
  }

  return (
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

          <Nav className="ms-auto align-items-center gap-3">
            {isAuthenticated && (
              <span style={{ color: "white" }}>
                {username}
              </span>
            )}

            {isAuthenticated && app_id != null && (
              <Button variant="outline-light">
                <img
                  src="http://127.0.0.1:9000/test/basket.png"
                  alt="cart"
                  style={{ width: "20px", height: "20px" }}
                />
                <Badge bg="danger" className="ms-2">
                  {count ?? 0}
                </Badge>
              </Button>
            )}

            {!isAuthenticated && (
              <Link to="/login">
                <Button variant="outline-light">
                  Войти
                </Button>
              </Link>
            )}

            {isAuthenticated && (
              <Button
                variant="outline-light"
                onClick={handleExit}
              >
                Выйти
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
