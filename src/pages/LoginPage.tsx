import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Form, Button, Alert, Container } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { AppDispatch, RootState } from "../store";
import { loginUserAsync } from "../store/userSlice";
import { getCartInfo } from "../store/telescopeObservationDraftSlice";
import { api } from "../api"

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const error = useSelector((state: RootState) => state.user.error);

  // изменение полей формы
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  // отправка формы
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!formData.username || !formData.password) return;

    const result = await dispatch(loginUserAsync(formData));

    // ЗАГРУЖАЕМ КОРЗИНУ ПОСЛЕ УСПЕШНОГО ЛОГИНА
    if (loginUserAsync.fulfilled.match(result)) {
      api.setSecurityData(result.payload.token);
      dispatch(getCartInfo());
      navigate("/");
    }
  }

  return (
    <Container style={{ maxWidth: "400px", marginTop: "150px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Рады снова Вас видеть!
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="username" className="mb-3">
          <Form.Label>Имя пользователя</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Введите имя пользователя"
          />
        </Form.Group>

        <Form.Group controlId="password" className="mb-4">
          <Form.Label>Пароль</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Введите пароль"
          />
        </Form.Group>

        <Button type="submit" variant="primary" style={{ width: "100%" }}>
          Войти
        </Button>
      </Form>
    </Container>
  );
}
