import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import type { RootState, AppDispatch } from "../store";
import { fetchUserDataAsync } from "../store/userSlice";
import { api } from "../api";

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { username, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    newUsername: username || ""
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'danger', text: string} | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
    dispatch(fetchUserDataAsync());
  }, [dispatch, isAuthenticated, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.currentPassword || !formData.newPassword) {
      setMessage({ type: 'danger', text: 'Заполните все поля пароля' });
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'danger', text: 'Новые пароли не совпадают' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      await api.users.putUsers({
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      });
      
      setMessage({ type: 'success', text: 'Пароль изменён' });
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      
    } catch (error: any) {
      setMessage({ 
        type: 'danger', 
        text: error?.response?.data?.error || 'Ошибка смены пароля' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.newUsername.trim()) {
      setMessage({ type: 'danger', text: 'Введите новое имя' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      await api.users.putUsers({
        username: formData.newUsername
      });
      
      setMessage({ type: 'success', text: `Имя изменено на: ${formData.newUsername}` });
      dispatch(fetchUserDataAsync());
      
    } catch (error: any) {
      setMessage({ 
        type: 'danger', 
        text: error?.response?.data?.error || 'Ошибка смены имени' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Требуется авторизация</Alert>
      </Container>
    );
  }
  
  return (
    <Container className="mt-4" style={{ maxWidth: "600px" }}>
      <h2 className="text-white mb-4">Личный кабинет</h2>
      
      {message && (
        <Alert 
          variant={message.type} 
          onClose={() => setMessage(null)} 
          dismissible
          className="mb-3"
        >
          {message.text}
        </Alert>
      )}
      
      <div className="bg-dark p-4 rounded border mb-4">
        <h5 className="text-white mb-3">Информация</h5>
        <p className="text-light mb-1">Пользователь: <strong>{username}</strong></p>
        <p className="text-light mb-0">Для изменения данных используйте формы ниже</p>
      </div>
      
      <div className="bg-dark p-4 rounded border mb-4">
        <h5 className="text-white mb-3">Смена пароля</h5>
        
        <Form onSubmit={handlePasswordChange}>
          <Form.Group className="mb-3">
            <Form.Label className="text-light">Текущий пароль</Form.Label>
            <Form.Control
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="bg-secondary text-white border-dark"
              disabled={loading}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label className="text-light">Новый пароль</Form.Label>
            <Form.Control
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="bg-secondary text-white border-dark"
              disabled={loading}
              required
              minLength={6}
            />
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label className="text-light">Подтвердите пароль</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="bg-secondary text-white border-dark"
              disabled={loading}
              required
            />
          </Form.Group>
          
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading}
            className="w-100"
          >
            {loading ? <Spinner size="sm" /> : "Сменить пароль"}
          </Button>
        </Form>
      </div>
      
      <div className="bg-dark p-4 rounded border">
        <h5 className="text-white mb-3">Смена имени</h5>
        
        <Form onSubmit={handleUsernameChange}>
          <Form.Group className="mb-4">
            <Form.Label className="text-light">Новое имя пользователя</Form.Label>
            <Form.Control
              type="text"
              name="newUsername"
              value={formData.newUsername}
              onChange={handleInputChange}
              className="bg-secondary text-white border-dark"
              disabled={loading}
              required
            />
          </Form.Group>
          
          <Button 
            variant="outline-primary" 
            type="submit" 
            disabled={loading || !formData.newUsername.trim()}
            className="w-100"
          >
            {loading ? <Spinner size="sm" /> : "Сменить имя"}
          </Button>
        </Form>
      </div>
    </Container>
  );
}