import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchUserObservations, moderateObservation } from "../store/observationsSlice";
import { fetchUserDataAsync } from "../store/userSlice";
import { 
  Spinner, Alert, Container, Card, Badge, Row, 
  Col, Button, ButtonGroup, Form, Modal
} from "react-bootstrap";



export default function MyObservationsPage() {
  console.log("=== MyObservationsPage рендерится ===");
  

  const dispatch = useDispatch<AppDispatch>();
  const { observations, loading, error } = useSelector(
    (state: RootState) => state.observations
  );
  
  // Данные пользователя - используем только is_moderator
  const { user_id, is_moderator, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  console.log("=== MyObservationsPage рендерится ===");
  console.log("is_moderator из store:", is_moderator);
  console.log("isAuthenticated:", isAuthenticated);
  console.log("user_id:", user_id);
  
  // Загружаем данные пользователя если они не загружены
  useEffect(() => {
  console.log("Проверка загрузки данных:", {
    isAuthenticated,
    user_id,
    shouldLoad: isAuthenticated && !user_id
  });
  
  if (isAuthenticated && !user_id) {
    console.log("Загружаем данные пользователя...");
    dispatch(fetchUserDataAsync());
  }
}, [dispatch, isAuthenticated, user_id]);
  
  // Состояние для фильтров
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    status: "",
    creator: ""
  });
  
  // Состояние для short polling - заменили NodeJS.Timeout на number
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Модальное окно для подтверждения действия
  const [showModal, setShowModal] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<any>(null);
  const [modalAction, setModalAction] = useState<"complete" | "reject">("complete");
  const [processing, setProcessing] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{variant: string, text: string} | null>(null);

  // Загрузка данных
  const loadData = () => {
    const queryParams = new URLSearchParams();
    
    if (filters.from) queryParams.append("from", filters.from);
    if (filters.to) queryParams.append("to", filters.to);
    if (filters.status) queryParams.append("status", filters.status);
    
    const queryString = queryParams.toString();
    dispatch(fetchUserObservations(queryString ? `?${queryString}` : ""));
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  // Short polling для модератора
  useEffect(() => {
    if (is_moderator && autoRefresh) {
      const interval = window.setInterval(() => {
        loadData();
        console.log("Auto-refreshing observations...");
      }, 5000); // Обновление каждые 5 секунд
      
      setPollingInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [is_moderator, autoRefresh]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    loadData();
  };

  const resetFilters = () => {
    setFilters({
      from: "",
      to: "",
      status: "",
      creator: ""
    });
    loadData();
  };

  // Обработка действий модератора
  const handleModeratorAction = (observationId: number, action: "complete" | "reject") => {
  setSelectedObservation(observations.find(o => 
    getObservationId(o) === observationId
  ));
  setModalAction(action);
  setShowModal(true);
};

  const confirmModeratorAction = async () => {
    if (!selectedObservation) {
      setShowModal(false);
      return;
    }

    setProcessing(true);
    try {
      // Используем thunk из slice
      await dispatch(moderateObservation({ 
        observationId: selectedObservation.telescopeObservationID, 
        action: modalAction 
      })).unwrap();
      
      // Показываем сообщение об успехе
      setAlertMessage({
        variant: "success",
        text: `Заявка успешно ${modalAction === "complete" ? "отправлена на асинхронный расчёт" : "отклонена"}`
      });
      
      // Закрываем модальное окно
      setShowModal(false);
      
      // Ждём 2 секунды и обновляем данные
      setTimeout(() => {
        loadData();
        setAlertMessage(null);
      }, 2000);
      
    } catch (error: any) {
      console.error("Ошибка выполнения действия:", error);
      setAlertMessage({
        variant: "danger",
        text: error || "Ошибка при выполнении действия"
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("ru-RU");
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("ru-RU", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Безопасные геттеры для полей с проверкой на undefined
const getObservationId = (obs: any): number => 
  obs?.TelescopeObservationID || obs?.telescopeObservationID || 0;

const getStatus = (obs: any): string => 
  obs?.Status || obs?.status || "неизвестно";

const getCreatedAt = (obs: any): string => 
  obs?.CreatedAt || obs?.createdAt || "";

const getObservationDate = (obs: any): string => 
  obs?.ObservationDate || obs?.observationDate || "";

const getObserverLatitude = (obs: any): number => 
  obs?.ObserverLatitude || obs?.observerLatitude || 0;

const getObserverLongitude = (obs: any): number => 
  obs?.ObserverLongitude || obs?.observerLongitude || 0;

const getFormationDate = (obs: any): string => 
  obs?.FormationDate || obs?.formationDate || "";

const getCompletionDate = (obs: any): string => 
  obs?.CompletionDate || obs?.completionDate || "";

const getCreatorId = (obs: any): number => 
  obs?.CreatorID || obs?.creatorID || 0;

const getModeratorId = (obs: any): number | null => 
  obs?.ModeratorID || obs?.moderatorID || null;

const getCompletedStarsCount = (obs: any): number => {
  const status = getStatus(obs);
  const count = obs?.completed_stars_count || obs?.CompletedStarsCount || 0;
  
  // Если заявка НЕ завершена, то completed_stars_count должен быть 0
  if (status !== "завершён" && status !== "completed") {
    return 0; // Для незавершённых заявок всегда 0
  }
  
  return count;
};

const getTotalStars = (obs: any): number => 
  obs?.total_stars || obs?.TotalStars || 0;

  if (error) return (
    <Container style={{ marginTop: "20px" }}>
      <Alert variant="danger">{error}</Alert>
    </Container>
  );

  // Фильтрация по создателю на фронтенде
  const filteredObservations = filters.creator 
  ? observations.filter(obs => {
      const creatorId = getCreatorId(obs);
      const creatorUsername = obs?.creator?.username || "";
      
      return (
        creatorId.toString().includes(filters.creator) || 
        creatorUsername.toLowerCase().includes(filters.creator.toLowerCase())
      );
    })
  : observations;

  return (
    <Container style={{ marginTop: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "white" }}>
        {is_moderator ? "Все заявки на наблюдения" : "Мои заявки на наблюдения"}
      </h2>
      
      {/* Alert сообщения */}
      {alertMessage && (
        <Alert 
          variant={alertMessage.variant as any} 
          onClose={() => setAlertMessage(null)} 
          dismissible
          style={{ marginBottom: "20px" }}
        >
          {alertMessage.text}
        </Alert>
      )}
      
      {/* Панель фильтров */}
      {is_moderator && (
        <Card style={{ backgroundColor: "#2c3034", border: "1px solid #444", marginBottom: "20px" }}>
          <Card.Body>
            <h5 style={{ color: "white", marginBottom: "15px" }}>Фильтры</h5>
            
            <Row className="g-3">
              {/* Фильтр по дате формирования */}
              <Col md={3}>
                <Form.Group>
                  <Form.Label style={{ color: "#adb5bd", fontSize: "0.9em" }}>
                    Дата от
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.from}
                    onChange={(e) => handleFilterChange("from", e.target.value)}
                    style={{ backgroundColor: "#495057", borderColor: "#6c757d", color: "white" }}
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label style={{ color: "#adb5bd", fontSize: "0.9em" }}>
                    Дата до
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.to}
                    onChange={(e) => handleFilterChange("to", e.target.value)}
                    style={{ backgroundColor: "#495057", borderColor: "#6c757d", color: "white" }}
                  />
                </Form.Group>
              </Col>
              
              {/* Фильтр по статусу */}
              <Col md={3}>
                <Form.Group>
                  <Form.Label style={{ color: "#adb5bd", fontSize: "0.9em" }}>
                    Статус
                  </Form.Label>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    style={{ backgroundColor: "#495057", borderColor: "#6c757d", color: "white" }}
                  >
                    <option value="">Все</option>
                    <option value="черновик">Черновик</option>
                    <option value="сформирован">Сформирован</option>
                    <option value="завершён">Завершён</option>
                    <option value="отклонён">Отклонён</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              {/* Фильтр по создателю (только фронтенд) */}
              <Col md={3}>
                <Form.Group>
                  <Form.Label style={{ color: "#adb5bd", fontSize: "0.9em" }}>
                    Создатель (ID/Имя)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="ID или имя"
                    value={filters.creator}
                    onChange={(e) => handleFilterChange("creator", e.target.value)}
                    style={{ backgroundColor: "#495057", borderColor: "#6c757d", color: "white" }}
                  />
                </Form.Group>
              </Col>
              
              <Col md={12} className="mt-3">
                <ButtonGroup>
                  <Button 
                    variant="primary" 
                    onClick={applyFilters}
                    style={{ marginRight: "10px" }}
                  >
                    Применить фильтры
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={resetFilters}
                    style={{ marginRight: "10px" }}
                  >
                    Сбросить
                  </Button>
                  
                  {/* Переключатель auto-refresh */}
                  <Button
                    variant={autoRefresh ? "success" : "outline-success"}
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    title="Автообновление каждые 5 секунд"
                  >
                    {autoRefresh ? " Автообновление ВКЛ" : " Автообновление ВЫКЛ"}
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      
      {/* Статистика */}
      <div style={{ color: "white", marginBottom: "15px", display: "flex", justifyContent: "space-between" }}>
        <div>
          Найдено заявок: {filteredObservations.length}
          {is_moderator && (
            <span style={{ marginLeft: "20px", color: "#adb5bd" }}>
              Всего: {observations.length}
            </span>
          )}
        </div>
        
        {loading && observations.length > 0 && (
          <div>
            <Spinner animation="border" size="sm" style={{ marginRight: "8px" }} />
            <span style={{ color: "#adb5bd" }}>Обновление...</span>
          </div>
        )}
      </div>
      
      {filteredObservations.length === 0 ? (
        <Alert variant="info">
          {filters.from || filters.to || filters.status || filters.creator 
            ? "Нет заявок по выбранным фильтрам" 
            : "У вас пока нет заявок"}
        </Alert>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {filteredObservations.map((obs) => {
            console.log(`Заявка #${getObservationId(obs)}:`, {
              status: getStatus(obs),
              totalStars: getTotalStars(obs),
              completedStarsCount: getCompletedStarsCount(obs),
              telescopeObservationStars: obs?.telescopeObservationStars?.length,
              stars: obs?.stars?.length,
              rawData: {
                total_stars: obs?.total_stars,
                completed_stars_count: obs?.completed_stars_count,
                Status: obs?.status,
                status: obs?.status
              }
            });

            const observationId = getObservationId(obs);
            const status = getStatus(obs);
            const completedStarsCount = getCompletedStarsCount(obs);
            
            return (
              <Card key={observationId} style={{ backgroundColor: "#2c3034", border: "1px solid #444" }}>
                <Card.Body>
                  <Row>
                    <Col md={is_moderator ? 7 : 8}>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                        <h5 style={{ margin: 0, marginRight: "15px", color: "white" }}>
                          Заявка #{observationId}
                        </h5>
                        <Badge bg={getStatusColor(status)} style={{ fontSize: "0.9em" }}>
                          {status}
                        </Badge>
                        
                        {/* Поле completed_stars_count */}
                        {completedStarsCount > 0 && (
                          <Badge bg="info" style={{ fontSize: "0.8em", marginLeft: "10px" }}>
                            Рассчитано: {completedStarsCount}
                          </Badge>
                        )}
                      </div>
                      
                      <div style={{ color: "#adb5bd", marginBottom: "8px" }}>
                        <strong>Дата создания:</strong> {formatDateTime(getCreatedAt(obs))}
                      </div>
                      
                      <div style={{ color: "#adb5bd", marginBottom: "8px" }}>
                        <strong>Дата наблюдения:</strong> {formatDate(getObservationDate(obs))}
                      </div>
                      
                      <div style={{ color: "#adb5bd", marginBottom: "8px" }}>
                        <strong>Координаты:</strong>{" "}
                        {getObserverLatitude(obs) !== 0 && getObserverLongitude(obs) !== 0 
                          ? `Ш: ${getObserverLatitude(obs)}°, Д: ${getObserverLongitude(obs)}°`
                          : "Не указаны"}
                      </div>
                      
                      {getFormationDate(obs) && (
                        <div style={{ color: "#adb5bd", marginBottom: "8px" }}>
                          <strong>Сформирована:</strong> {formatDateTime(getFormationDate(obs))}
                        </div>
                      )}
                      
                      {getCompletionDate(obs) && (
                        <div style={{ color: "#adb5bd", marginBottom: "8px" }}>
                          <strong>Завершена:</strong> {formatDateTime(getCompletionDate(obs))}
                        </div>
                      )}
                    </Col>
                    
                    <Col md={is_moderator ? 5 : 4} style={{ borderLeft: "1px solid #444", paddingLeft: "20px" }}>
                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ color: "#adb5bd", fontSize: "0.9em" }}>ID создателя:</div>
                        <div style={{ color: "white", fontWeight: "bold" }}>{getCreatorId(obs)}</div>
                      </div>
                      
                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ color: "#adb5bd", fontSize: "0.9em" }}>Модератор:</div>
                        <div style={{ color: "white", fontWeight: "bold" }}>
                          {getModeratorId(obs)
                            ? `ID: ${getModeratorId(obs)}`
                            : <Badge bg="secondary">Ожидает</Badge>
                          }
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: "15px" }}>
                      <div style={{ color: "#adb5bd", fontSize: "0.9em", marginBottom: "4px" }}>
                        Прогресс расчёта:
                      </div>
                      
                      {/* Основной прогресс */}
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "6px"
                      }}>
                        {/* Дробь и процент */}
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center",
                          gap: "6px"
                        }}>
                          <span style={{ 
                            color: getTotalStars(obs) > 0 && getCompletedStarsCount(obs) === getTotalStars(obs) 
                              ? "#198754" 
                              : getCompletedStarsCount(obs) > 0 
                                ? "#0dcaf0" 
                                : "#adb5bd", 
                            fontWeight: "bold",
                            fontSize: "1.1em"
                          }}>
                            {getCompletedStarsCount(obs)} / {getTotalStars(obs)}
                          </span>
                          
                          {getTotalStars(obs) > 0 && (
                            <span style={{ 
                              fontSize: "0.85em", 
                              color: "#6c757d",
                              backgroundColor: "#2c3034",
                              padding: "2px 6px",
                              borderRadius: "4px"
                            }}>
                              {Math.round((getCompletedStarsCount(obs) / getTotalStars(obs)) * 100)}%
                            </span>
                          )}
                        </div>
                        
                        {/* Статус иконка */}
                        {getTotalStars(obs) > 0 && (
                          <span style={{ 
                            fontSize: "0.9em",
                            color: getCompletedStarsCount(obs) === getTotalStars(obs) 
                              ? "#198754" 
                              : getCompletedStarsCount(obs) > 0 
                                ? "#0dcaf0" 
                                : "#6c757d"
                          }}>
                            {getCompletedStarsCount(obs) === getTotalStars(obs) 
                              ? "" 
                              : getCompletedStarsCount(obs) > 0 
                                ? "" 
                                : ""}
                          </span>
                        )}
                      </div>
                                           
                      {/* Текстовый статус */}
                      {getTotalStars(obs) > 0 && (
                        <div style={{ 
                          color: "#6c757d", 
                          fontSize: "0.8em", 
                          marginTop: "4px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <span>
                            {getCompletedStarsCount(obs) === getTotalStars(obs) 
                              ? "Все звёзды рассчитаны" 
                              : getCompletedStarsCount(obs) > 0 
                                ? `Рассчитано ${getCompletedStarsCount(obs)} из ${getTotalStars(obs)}` 
                                : "Расчёт не начат"}
                          </span>
                        </div>
                      )}
                    </div>
                      
                      {/* Кнопки действий для модератора */}
                      {is_moderator && status === "сформирован" && (
                        <div style={{ marginTop: "15px" }}>
                          <ButtonGroup>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleModeratorAction(observationId, "complete")}
                              style={{ marginRight: "8px" }}
                            >
                              Завершить
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleModeratorAction(observationId, "reject")}
                            >
                              Отклонить
                            </Button>
                          </ButtonGroup>
                          
                          <div style={{ color: "#adb5bd", fontSize: "0.8em", marginTop: "5px" }}>
                            Запустит асинхронный расчёт сложности наведения
                          </div>
                        </div>
                      )}
                      
                      {/* Сообщение о статусе расчёта */}
                      {status === "сформирован" && is_moderator && (
                        <div style={{ color: "#ffc107", fontSize: "0.9em", marginTop: "10px" }}>
                          Готова для обработки модератором
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Модальное окно подтверждения действия */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: "#2c3034", color: "white" }}>
          <Modal.Title>
            {modalAction === "complete" ? "Завершение заявки" : "Отклонение заявки"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#2c3034", color: "white" }}>
          {selectedObservation && (
            <>
                <p>
                    Вы уверены, что хотите {modalAction === "complete" ? "завершить" : "отклонить"} заявку 
                    #{selectedObservation ? getObservationId(selectedObservation) : ''}?
                </p>
              
              {modalAction === "complete" && (
                <Alert variant="info">
                  <strong>Внимание:</strong> Будет запущен асинхронный расчёт индекса сложности наведения 
                  для всех звёзд в заявке. Расчёт займет 5-10 секунд.
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#2c3034", borderTop: "1px solid #444" }}>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={processing}>
            Отмена
          </Button>
          <Button 
            variant={modalAction === "complete" ? "success" : "danger"} 
            onClick={confirmModeratorAction}
            disabled={processing}
          >
            {processing ? (
              <>
                <Spinner animation="border" size="sm" style={{ marginRight: "8px" }} />
                {modalAction === "complete" ? "Завершение..." : "Отклонение..."}
              </>
            ) : (
              modalAction === "complete" ? "Завершить" : "Отклонить"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

function getStatusColor(status: string) {
  const statusLower = (status || "").toLowerCase();
  
  if (statusLower.includes("черновик") || statusLower.includes("draft")) 
    return "warning";
  if (statusLower.includes("сформирован") || statusLower.includes("submitted")) 
    return "primary";
  if (statusLower.includes("завершён") || statusLower.includes("completed")) 
    return "success";
  if (statusLower.includes("отклонен") || statusLower.includes("rejected")) 
    return "danger";
  
  return "secondary";
}