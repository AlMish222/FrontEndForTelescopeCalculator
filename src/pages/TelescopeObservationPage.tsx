import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Header from "../components/Header";
import { getObservationDraft } from "../store/telescopeObservationDraftSlice";
import type { AppDispatch, RootState } from "../store";
import "../styles/TelescopeObservationPage.css";
import { Link } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";

export default function TelescopeObservationPage() {
    const { observationId } = useParams<{ observationId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { observation, loading, error } = useSelector(
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

    const handleDeleteCart = () => {
        if (window.confirm("Вы уверены, что хотите удалить эту корзину?")) {
        // TODO: Реализовать удаление в шаге 5
        console.log("Удаление корзины", observationId);
        }
    };

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

    if (!isAuthenticated) {
        return (
        <div className="telescope-observation-page">
            <Header />
            <div className="cart-container">
            <Alert variant="warning">Для просмотра корзины необходимо авторизоваться.</Alert>
            </div>
        </div>
        );
    }

    if (loading) {
        return (
        <div className="telescope-observation-page">
            <Header />
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

                {observation && observation.stars && observation.stars.length > 0 ? (
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

                                    {star.quantity && star.quantity > 0 && (
                                        <div className="quantity-controls">
                                        <span className="item-count">{star.quantity}</span>
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
                            </div>
                        ))}
                    </div>
                ) : (
                <div className="empty-cart">
                    <p>Корзина пуста</p>
                    <Link to="/stars" className="back-button">Вернуться к выбору</Link>
                </div>
                )}
            </div>

            {observation && observation.stars && observation.stars.length > 0 && (
                <div className="cart-footer-left">
                <button 
                    type="button" 
                    className="footer-button delete-order"
                    onClick={handleDeleteCart}
                >
                    Удалить корзину
                </button>
                </div>
            )}
        </div>
    );
}