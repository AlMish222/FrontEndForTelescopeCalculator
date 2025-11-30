import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Container, 
  Button, 
  Breadcrumb, 
  Spinner, 
  Card, 
  Row, 
  Col,
  Image 
} from "react-bootstrap";
import { getStarById } from "../api/stars";
import type { Star } from "../types/star";
import "../styles/StarDetailPage.css";

export default function StarDetailPage() {
  const { id } = useParams();
  const starId = Number(id);

  const [star, setStar] = useState<Star | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getStarById(starId);
        setStar(data);
      } catch (e) {
        console.error("Ошибка загрузки звезды:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [starId]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!star) {
    return (
      <Container className="text-center mt-5">
        <h2>Звезда не найдена</h2>
        <Link to="/stars">
          <Button variant="secondary" className="mt-3">Назад к списку</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="star-detail-page">

      <Breadcrumb className="my-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Главная
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/stars" }}>
          Звёзды
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{star.StarName}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Заголовок */}
      <Card className="bg-dark text-white mb-4">
        <Card.Body>
          <Card.Title as="h1" className="mb-0">
            Информация о звезде: {star.StarName}
          </Card.Title>
        </Card.Body>
      </Card>

      {/* Основная информация */}
      <Card className="detail-card">
        <Card.Body className="p-4">
          
          {/* Название и изображение в одной строке */}
          <Row className="align-items-start mb-4">
            <Col md={8}>
              <Card.Title as="h2" className="star-name-title">
                Название: {star.StarName}
              </Card.Title>
            </Col>
            <Col md={4} className="text-center">
              <Image
                src={star.ImageURL || "https://placehold.co/400x400?text=No+Image"}
                alt={star.StarName}
                className="detail-star-image"
                fluid
                roundedCircle
              />
            </Col>
          </Row>

          {/* Описание */}
          <Card className="bg-light">
            <Card.Body>
              <Card.Title as="h3" className="description-title">
                Описание:
              </Card.Title>
              <Card.Text className="description-text">
                {star.Description}
              </Card.Text>
            </Card.Body>
          </Card>

          {/* Кнопки */}
          <Row className="mt-4">
            <Col>
              {/* <Link to="/stars">
                <Button variant="outline-secondary" className="me-2">
                  Назад
                </Button>
              </Link>
              <Button variant="success">
                Добавить в корзину
              </Button> */}
            </Col>
          </Row>

        </Card.Body>
      </Card>
    </Container>
  );
}