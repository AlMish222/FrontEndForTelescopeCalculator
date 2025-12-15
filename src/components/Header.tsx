import { Container, Navbar, Nav, Button, Badge } from "react-bootstrap";
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

  const { app_id, observation, count } = useSelector(
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
      }, 500);
      
      // // 3. Если через 1500ms всё ещё нет данных, ещё одна попытка
      // const timer2 = setTimeout(() => {
      //   if (isAuthenticated && !app_id && retryCount < 3) {
      //     console.log("Повторная попытка загрузки корзины (таймаут 2)...");
      //     dispatch(getCartInfo());
      //   }
      // }, 1500);
      
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

  const displayCount = observation?.stars?.reduce((sum: number, star: any) => {
    return sum + (star.quantity || 1);
  }, 0) || count || 0;

  function handleCartClick() {
    if (app_id != null) {
      navigate(`/observation/${app_id}`);
    }
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

            {(isAuthenticated && (app_id != null || observation)) && (
              <Button 
                variant="outline-light" 
                onClick={handleCartClick} 
                style={{ cursor: "pointer", position: "relative", padding: "8px 12px", opacity: app_id ? 1 : 0.7}}
                disabled={!app_id}
                title={app_id ? "Перейти в корзину" : "Корзина загружается..."}
              >
                <img
                  src="http://127.0.0.1:9000/test/basket.png"
                  alt="cart"
                  style={{ width: "20px", height: "20px" }}
                />
                {displayCount > 0 && (
                  <Badge 
                    bg="danger" 
                    style={{ 
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      fontSize: "0.7rem",
                      minWidth: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {displayCount}
                  </Badge>
                )}
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
