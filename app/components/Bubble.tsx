import React from 'react';
import ReactMarkdown from 'react-markdown';

const Bubble = ({ message }) => {
  return (
    <div className="bubble">
      <ReactMarkdown>{message.content}</ReactMarkdown>
    </div>
  );
};

export default Bubble;
