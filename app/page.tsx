// Page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation"; // Para navegação no cliente

const Page = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/home"); // Navega para a página de chat
  };

  return (
    <div className="page-container">
      <h1>Bem-vindo ao RAGSearch</h1>
      <p>Escolha um ícone abaixo para começar a conversar.</p>
      <div className="icon-container" onClick={handleClick}>
        <img src="/workspaces/RAG-Chatbot/app/assets/f1GPTLogo.jpg" alt="Ícone" className="icon" />
      </div>
    </div>
  );
};

export default Page;
