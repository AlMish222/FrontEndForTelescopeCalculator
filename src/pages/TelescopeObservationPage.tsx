import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Header from "../components/Header";
import { 
    getObservationDraft,
    deleteObservation,
    updateObservation,
    deleteStarFromObservation,
    updateStarInObservation,
    submitObservation,
    setObservationData
 } from "../store/telescopeObservationDraftSlice";
import type { AppDispatch, RootState } from "../store";
import "../styles/TelescopeObservationPage.css";
import { Link } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";

export default function TelescopeObservationPage() {
    const { observationId } = useParams<{ observationId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [observationDate, setObservationDate] = useState("");
    const [observerLatitude, setObserverLatitude] = useState("");
    const [observerLongitude, setObserverLongitude] = useState("");
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    const { observation, loading, error, isDraft } = useSelector(
        (state: RootState) => state.telescopeObservationDraft
    );
    const { isAuthenticated } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (observationId && isAuthenticated) {
            const id = parseInt(observationId);
            if (!isNaN(id)) {
                dispatch(getObservationDraft(id));
            }
        }
    }, [dispatch, observationId, isAuthenticated]);

    useEffect(() => {
        if (observation?.stars) {
            const initialQuantities: Record<number, number> = {};
            observation.stars.forEach((star: any) => {
                if (star.starID) {
                    initialQuantities[star.starID] = star.quantity || 1;
                }
            });
            setQuantities(initialQuantities);
            
            // Инициализация полей формы
            setObservationDate(observation.observationDate?.split("T")[0] || "");
            setObserverLatitude(observation.observerLatitude?.toString() || "");
            setObserverLongitude(observation.observerLongitude?.toString() || "");
        }
    }, [observation]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return "не указана";
        try {
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
        } catch {
        return "не указана";
        }
    };

    // Удаление заявки
    const handleDeleteObservation = () => {
        if (observationId && isDraft && window.confirm("Вы уверены, что хотите удалить эту корзину?")) {
            const id = parseInt(observationId);
            dispatch(deleteObservation(id))
                .unwrap()
                .then(() => {
                    alert("Заявка удалена");
                    navigate("/stars");
                })
                .catch((err) => {
                    alert(`Ошибка: ${err}. Удаление доступно только модераторам.`);
                });
        }
    };

    // Сохранение заявки
    const handleSaveObservation = () => {
        if (observationId && observation) {
            const id = parseInt(observationId);
            const observationData = {
                observationDate: observationDate ? `${observationDate}T00:00:00Z` : undefined,
                observerLatitude: observerLatitude ? parseFloat(observerLatitude) : undefined,
                observerLongitude: observerLongitude ? parseFloat(observerLongitude) : undefined,
            };

            dispatch(updateObservation({ observationId: id, observationData }))
                .unwrap()
                .then(() => {
                    setEditing(false);
                    dispatch(setObservationData(observationData));
                    alert("Данные сохранены!");
                })
                .catch((err) => {
                    alert(`Ошибка при сохранении: ${err}`);
                });
        }
    };

    // Удаление звезды из заявки
    const handleDeleteStar = (starId: number) => {
        if (observationId && window.confirm("Удалить звезду из корзины?")) {
            const obsId = parseInt(observationId);
            dispatch(deleteStarFromObservation({ observationId: obsId, starId }))
                .unwrap()
                .then(() => {
                    // Количество обновится через extraReducers
                })
                .catch((err) => {
                    alert(`Ошибка: ${err}`);
                });
        }
    };

    // ф-ия отправки заявки
    const handleSubmitObservation = () => {
        if (observationId && isDraft && window.confirm("Отправить заявку на рассмотрение?")) {
            const id = parseInt(observationId);
            dispatch(submitObservation(id))
                .unwrap()
                .then(() => {
                    alert("Заявка успешно отправлена на рассмотрение!");
                    navigate("/stars");
                })
                .catch((err) => {
                    alert(`Ошибка: ${err}`);
                });
        }
    };

    // изменение кол-ва звёзд
    const handleQuantityChange = (starId: number, change: number) => {
        const currentQuantity = quantities[starId] || 1;
        const newQuantity = Math.max(1, currentQuantity + change);
        
        setQuantities(prev => ({
            ...prev,
            [starId]: newQuantity
        }));
        
        // Автосохранение при изменении
        if (observationId) {
            const id = parseInt(observationId);
            dispatch(updateStarInObservation({
                observationId: id,
                starId,
                updates: { quantity: newQuantity }
            }));
        }
    };

    ////////////

    if (!isAuthenticated) {
        return (
            <div className="telescope-observation-page">
                <div className="cart-container">
                    <Alert variant="warning">Для просмотра корзины необходимо авторизоваться.</Alert>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="telescope-observation-page">
                <div className="cart-container text-center">
                    <Spinner animation="border" />
                </div>
            </div>
        );
    }

    return (
        <div className="telescope-observation-page">
            <div className="cart-container" id={`cart-${observationId}`}>
                <h1>Ваша корзина</h1>

                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

                {observation ? (
                    <>
                        <div className="observation-info-card">
                            <h3>Информация о наблюдении</h3>
            
                            {!isDraft ? (
                                // Только просмотр, если не черновик
                                <div className="observation-info-view">
                                    <p><strong>Статус:</strong> {observation.status || "черновик"}</p>
                                    {observation.observerLatitude && (
                                        <p><strong>Широта:</strong> {observation.observerLatitude}</p>
                                    )}
                                    {observation.observerLongitude && (
                                        <p><strong>Долгота:</strong> {observation.observerLongitude}</p>
                                    )}
                                    {observation.observationDate && (
                                        <p><strong>Дата наблюдения:</strong> {formatDate(observation.observationDate)}</p>
                                    )}
                                </div>
                            ) : editing ? (
                            // Редактирование для черновиков
                                <div className="observation-info-edit">
                                    <div className="form-group">
                                        <label>Дата наблюдения:</label>
                                        <input
                                            type="date"
                                            value={observationDate}
                                            onChange={(e) => setObservationDate(e.target.value)}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Широта наблюдателя:</label>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            value={observerLatitude}
                                            onChange={(e) => setObserverLatitude(e.target.value)}
                                            className="form-control"
                                            placeholder="55.7558"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Долгота наблюдателя:</label>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            value={observerLongitude}
                                            onChange={(e) => setObserverLongitude(e.target.value)}
                                            className="form-control"
                                            placeholder="37.6176"
                                        />
                                    </div>
                                    <div className="edit-buttons">
                                        <button className="btn btn-primary save-btn" onClick={handleSaveObservation}>
                                            Сохранить
                                        </button>
                                        <button className="btn btn-secondary cancel-btn" onClick={() => setEditing(false)}>
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Просмотр с кнопкой редактирования
                                <div className="observation-info-view">
                                    <p><strong>Статус:</strong> {observation.status || "черновик"}</p>
                                    {observation.observerLatitude && (
                                        <p><strong>Широта:</strong> {observation.observerLatitude}</p>
                                    )}
                                    {observation.observerLongitude && (
                                        <p><strong>Долгота:</strong> {observation.observerLongitude}</p>
                                    )}
                                    {observation.observationDate && (
                                        <p><strong>Дата наблюдения:</strong> {formatDate(observation.observationDate)}</p>
                                    )}
                                    <button className="btn btn-outline-primary edit-btn" onClick={() => setEditing(true)}>
                                        Редактировать
                                    </button>
                                </div>
                            )}
                        </div>

                        <h4>Выбранные звёзды ({observation.stars?.length || 0})</h4>
          
                        {observation.stars && observation.stars.length > 0 ? (
                            <div className="cart-items">
                                {observation.stars.map((star: any) => (
                                    <div className="cart-item" key={star.starID}>
                                        <div className="item-image-container">
                                            <div className="item-image-background"></div>
                                            <img 
                                                src={star.imageURL || "https://placehold.co/150x150?text=No+Image"} 
                                                alt={star.starName} 
                                                className="item-image"
                                                onError={(e) => {
                                                    e.currentTarget.src = "https://placehold.co/150x150?text=No+Image";
                                                }}
                                            />
                                        </div>

                                        <div className="item-info">
                                            <h3 className="item-title">{star.starName}</h3>
                                            <p className="item-description">{star.shortDescription}</p>

                                            {/* Блок управления количеством */}
                                            {isDraft ? (
                                                <div className="quantity-controls-editable">
                                                    <button 
                                                        className="quantity-btn decrease"
                                                        onClick={() => handleQuantityChange(star.starID, -1)}
                                                        disabled={(quantities[star.starID] || star.quantity || 1) <= 1}
                                                    >
                                                        −
                                                    </button>
                                                    
                                                    <span className="item-count">
                                                        {quantities[star.starID] || star.quantity || 1}
                                                    </span>
                                                    
                                                    <button 
                                                        className="quantity-btn increase"
                                                        onClick={() => handleQuantityChange(star.starID, 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="quantity-controls">
                                                    <span className="item-count">{star.quantity || 1}</span>
                                                </div>
                                            )}

                                            <div className="observation-container">
                                                {observation.observerLatitude && (
                                                    <span className="observer-coord">Широта: {observation.observerLatitude}</span>
                                                )}
                                                {observation.observerLongitude && (
                                                    <span className="observer-coord">Долгота: {observation.observerLongitude}</span>
                                                )}
                                                <span className="observation-date">
                                                    Дата наблюдения: {formatDate(observation.observationDate)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="star-coord-container">
                                            {star.ra !== undefined && <span className="star-coord">RA: {star.ra}</span>}
                                            {star.dec !== undefined && <span className="star-coord">Dec: {star.dec}</span>}
                                            <span className="star-coord">
                                                Результат: {star.resultValue || "42.5"}
                                            </span>
                                        </div>

                                        {/* Кнопка удаления звезды (только для черновиков) */}
                                        {isDraft && (
                                            <button
                                                className="delete-star-btn"
                                                onClick={() => handleDeleteStar(star.starID)}
                                                title="Удалить звезду из корзины"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Alert variant="info" className="mt-3">
                                В этой заявке пока нет звёзд.
                            </Alert>
                        )}
                    </>
                ) : (
                    <Alert variant="warning">
                        Заявка не найдена.
                    </Alert>
                )}
            </div>

            {/* Кнопки для черновиков */}
            {observation && isDraft && (
                <div className="cart-footer-left">
                    <button 
                        type="button" 
                        className="footer-button submit-order"
                        onClick={handleSubmitObservation}
                    >
                        Отправить заявку
                    </button>
                    
                    <button 
                        type="button" 
                        className="footer-button delete-order"
                        onClick={handleDeleteObservation}
                    >
                        Удалить корзину
                    </button>
                </div>
            )}
        </div>
    );
}