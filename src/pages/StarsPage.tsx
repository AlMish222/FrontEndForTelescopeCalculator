import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Breadcrumb } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getStars } from "../api/stars";
import type { Star } from "../types/star";
import "../styles/StarsPage.css"

export default function StarsPage() {
  const [stars, setStars] = useState<Star[]>([]);
  const [query, setQuery] = useState("");

  async function loadStars() {
    try {
      const data = await getStars(query);
      setStars(data);
    } catch (e) {
      console.error("Ошибка загрузки звёзд", e);
    }
  }

  useEffect(() => {
    loadStars();
  }, [query]);

  return (
    <Container className="stars-page">

      <div className="breadcrumbs-fixed">
        <Breadcrumb>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
            Главная
          </Breadcrumb.Item>

          <Breadcrumb.Item active>
            Звёзды
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <Form className="mb-3" onSubmit={(e) => e.preventDefault()}>
        <Form.Control
          type="text"
          className="search-input"
          placeholder="Введите название звезды…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Form>

      <Row>
        {stars.map((star) => (
          <Col key={star.StarID} sm={12} md={6} lg={3} className="mb-4">

            <Card className="h-100 shadow-sm star-card">

              <div className="image-container">
                <div className="image-background"></div>

                <img
                  className="image"
                  src={star.ImageURL || "https://placehold.co/300x300?text=No+Image"}
                  alt={star.StarName}
                />
              </div>

              <Card.Body>
                <Card.Title className="star-title">{star.StarName}</Card.Title>
                <Card.Text className="star-text">{star.ShortDescription}</Card.Text>

                <div className="card-buttons">                  
                    <Link to={`/stars/${star.StarID}`}>
                        <Button variant="primary">Подробнее</Button>
                    </Link>

                  {/* <Button variant="outline-success">Добавить</Button> */}
                </div>
              </Card.Body>

            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
