import { Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

import Header from "./components/Header";

import HomePage from "./pages/HomePage";
import StarsPage from "./pages/StarsPage";
import StarDetailPage from "./pages/StarDetailPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  useEffect(() => {
    invoke("tauri", { cmd: "create" })
      .then((response: any) => console.log(response))
      .catch((error: any) => console.log(error));

    return () => {
      invoke("tauri", { cmd: "close" })
        .then((response: any) => console.log(response))
        .catch((error: any) => console.log(error));
    };
  }, []);

  return (
    <>
      <Header />

      <Container className="mt-5 pt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/stars" element={<StarsPage />} />
          <Route path="/stars/:id" element={<StarDetailPage />} />

          <Route path="*" element={<h2>Страница не найдена</h2>} />
        </Routes>
      </Container>
    </>
  );
}
