import React from 'react';
import ReactMarkdown from 'react-markdown';

const Bubble = ({ message }) => {
  // Definir a classe com base no role da mensagem
  const bubbleClass = message.role === 'user' ? 'bubble user' : 'bubble assistant';

  return (
    <div className={bubbleClass}>
      <ReactMarkdown>{message.content}</ReactMarkdown>
    </div>
  );
};

export default Bubble;
