import React from "react";
import { Card } from "react-bootstrap";
import "../styles/HomePage.css"

const HomePage: React.FC = () => {
  return (
    <Card className="home-card shadow-sm">
      <Card.Body>
        <Card.Title className="home-title">
          Приветствую в Калькуляторе для телескопа
        </Card.Title>

        <Card.Text className="home-text">
          This is a small SPA built for lab work. Use the Services page to view available services.
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default HomePage;
