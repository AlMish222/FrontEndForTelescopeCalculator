import { Container, Navbar, Nav, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import type { AppDispatch, RootState } from "../store";
import { logoutUserAsync } from "../store/userSlice";
import { getCartInfo } from "../store/telescopeObservationDraftSlice";

export default function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);

  const { isAuthenticated, username } = useSelector(
    (state: RootState) => state.user
  );

  const { app_id, observation } = useSelector(
    (state: RootState) => state.telescopeObservationDraft
  );

  useEffect(() => {
    if (isAuthenticated) {
      console.log("Загружаем корзину...", { app_id, hasObservation: !!observation });
      
      // 1. Сразу загружаем корзину
      dispatch(getCartInfo());
      
      // 2. Если через 500ms нет app_id или observation, пробуем ещё раз
      const timer1 = setTimeout(() => {
        if (isAuthenticated && !app_id) {
          console.log("Повторная попытка загрузки корзины (таймаут 1)...");
          dispatch(getCartInfo());
          setRetryCount(prev => prev + 1);
        }
      }, 1500);
      
      
      // 3. Слушаем события visibilitychange (возврат на вкладку)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && isAuthenticated) {
          console.log("Вернулись на вкладку, обновляем корзину...");
          dispatch(getCartInfo());
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearTimeout(timer1);
        // clearTimeout(timer2);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [dispatch, isAuthenticated, app_id, observation, retryCount]);

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
            <Nav.Link as={Link} to="/my-observations">Мои заявки</Nav.Link>
            <Nav.Link as={Link} to="/profile">Личный кабинет</Nav.Link>
          </Nav>

          <Nav className="ms-auto align-items-center gap-3">
            {isAuthenticated && (
              <span style={{ color: "white" }}>
                {username}
              </span>
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
