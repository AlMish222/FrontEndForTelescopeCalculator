import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const AppNavbar: React.FC = () => {
  return (
    <Navbar bg="light" expand="lg" fixed="top">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>Расчёт углов наведения стационарного телескопа</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Home</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/services">
              <Nav.Link>Services</Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
