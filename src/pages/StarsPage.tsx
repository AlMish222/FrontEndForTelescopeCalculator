import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Breadcrumb, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { ModelsStar } from "../api/Api";
import { getStarsList, setSearchValue } from "../store/starsSlice";
import type { RootState, AppDispatch } from "../store";
import { addStarToObservation, getCartInfo } from "../store/telescopeObservationDraftSlice";
import "../styles/StarsPage.css";

export default function StarsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [addingStarId, setAddingStarId] = useState<number | null>(null);

  const { searchValue, stars, loading } = useSelector(
    (state: RootState) => state.stars
  );

  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const { loading: cartLoading } = useSelector(
    (state: RootState) => state.telescopeObservationDraft
  );
  // const { app_id } = useSelector((state: RootState) => state.telescopeObservationDraft);

  // загрузка списка при монтировании и при изменении поиска
  useEffect(() => {
    dispatch(getStarsList());

    if (isAuthenticated) {
      dispatch(getCartInfo());
    }
  }, [dispatch, isAuthenticated]);

  const handleAddToObservation = async (star: ModelsStar) => {
    if (star.starID && isAuthenticated) {
      setAddingStarId(star.starID);
      try {
        await dispatch(addStarToObservation(star.starID)).unwrap();
        console.log(`Звезда ${star.starName} добавлена в наблюдение`);
      } catch (error) {
        console.error("Ошибка при добавлении звезды:", error);
      } finally {
        setAddingStarId(null);
      }
    }
  };

  return (
    <Container className="stars-page">
      <div className="breadcrumbs-fixed">
        <Breadcrumb>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
            Главная
          </Breadcrumb.Item>
          <Breadcrumb.Item active>Звёзды</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <Form className="mb-3" onSubmit={(e) => e.preventDefault()}>
        <Form.Control
          type="text"
          className="search-input"
          placeholder="Введите название звезды…"
          value={searchValue}
          onChange={(e) => dispatch(setSearchValue(e.target.value))}
          //disabled={loading}
        />
        <Button
          type="button"
          disabled={loading}
          onClick={() => dispatch(getStarsList())}
        >
          Найти
        </Button>
      </Form>

      {loading ? (
        <div className="d-flex justify-content-center mt-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row>
          {stars.length ? (
            stars.map((star: ModelsStar) => (
              <Col key={star.starID} sm={12} md={6} lg={3} className="mb-4">
                <Card className="h-100 shadow-sm star-card">
                  <div className="image-container">
                    <div className="image-background"></div>
                    <img
                      className="image"
                      src={
                        star.imageURL ||
                        "https://placehold.co/300x300?text=No+Image"
                      }
                      alt={star.starName}
                    />
                  </div>

                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="star-title">
                      {star.starName}
                    </Card.Title>
                    <Card.Text className="star-text">
                      {star.shortDescription}
                    </Card.Text>

                    <div className="card-buttons">
                      <Link to={`/stars/${star.starID}`}>
                        <Button variant="primary">Подробнее</Button>
                      </Link>

                      {isAuthenticated ? (
                        <Button
                          variant="outline-primary"
                          className="flex-grow-1"
                          onClick={() => handleAddToObservation(star)}
                          disabled={cartLoading || addingStarId === star.starID}
                        >
                          {addingStarId === star.starID ? (
                            <>
                              <Spinner
                                animation="border"
                                size="sm"
                                className="me-2"
                              />
                              Добавляется...
                            </>
                          ) : (
                            "В корзину"
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="outline-secondary"
                          className="flex-grow-1"
                          disabled
                          title="Войдите для добавления"
                        >
                          В корзину
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col>
              <h4 className="text-center mt-5">
                К сожалению, ничего не найдено
              </h4>
            </Col>
          )}
        </Row>
      )}
    </Container>
  );
}
