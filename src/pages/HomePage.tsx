import React from "react";
import { Card, Carousel } from "react-bootstrap";
import "../styles/HomePage.css"

const HomePage: React.FC = () => {
  return (
    <>
      <Carousel className="home-carousel mb-4">
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="http://127.0.0.1:9000/test/slide1.jpg"
            alt="Первый слайд"
          />
          <Carousel.Caption>
            <h3>Красота космоса</h3>
            <p>Лучшие фото звёзд и галактик</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src="http://127.0.0.1:9000/test/slide3.jpg"
            alt="Второй слайд"
          />
          <Carousel.Caption>
            <h3>Исследуй вселенную</h3>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src="http://127.0.0.1:9000/test/slide2.jpg"
            alt="Третий слайд"
          />
          <Carousel.Caption>
            <h3>Красные гиганты (Бетельгейзе)</h3>
          </Carousel.Caption>
        </Carousel.Item>

      </Carousel>

      <Card className="home-card shadow-sm">
        <Card.Body>
          <Card.Title className="home-title">
            Приветствую в Калькуляторе для телескопа
          </Card.Title>

          <Card.Text className="home-text">
            Назначение системы заключается в предоставлении астрономам возможности автоматизировать процесс расчёта требуемых координат
            для более наведения телескопа на интересующие их звёзды самостоятельно. Создатели заявок могут формировать и редактировать собственные расчёты.
            Астрофизик проверяет корректность информации о звёздах, принимает или отклоняет заявки на добавление новых объектов,
            а также управляет списком доступных звёзд. Гости системы могут просматривать описания звёзд и пройти регистрацию для последующей работы с личными заявками и избранными объектами.
          </Card.Text>
        </Card.Body>
      </Card>
    </>
  );
};

export default HomePage;
