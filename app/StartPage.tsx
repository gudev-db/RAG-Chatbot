"use client";

import { useRouter } from "next/navigation";

const StartPage = () => {
  const router = useRouter();

  const handleStartChat = () => {
    router.push("/chat"); // Ajuste para corresponder ao caminho da sua página de chat
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Bem-vindo ao Luiz Lourenço!</h1>
      <p className="text-gray-600 mb-6">Seu assistente virtual inteligente.</p>
      <button
        onClick={handleStartChat}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
      >
        Iniciar Conversa
      </button>
    </main>
  );
};

export default StartPage;
