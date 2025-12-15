import { useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Breadcrumb, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { ModelsStar } from "../api/Api";
import { getStarsList, setSearchValue } from "../store/starsSlice";
import type { RootState, AppDispatch } from "../store";
import "../styles/StarsPage.css";

export default function StarsPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { searchValue, stars, loading } = useSelector(
    (state: RootState) => state.stars
  );

  // загрузка списка при монтировании и при изменении поиска
  useEffect(() => {
    dispatch(getStarsList());
  }, [dispatch]);

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

                  <Card.Body>
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
