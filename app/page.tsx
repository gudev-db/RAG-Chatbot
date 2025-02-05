"use client";
import Image from "next/image";
import pikachu from "./assets/pikachu.jpg";
import { useChat } from "ai/react";
import { Message } from "ai";
import Bubble from "./components/Bubble";
import LoadingBubble from "./components/LoadingBubble";
import PromptSuggestionRow from "./components/PromptSuggestionsRow";



const UserInput = ({ input, handleInputChange, handleSubmit }) => {
  return (
    <div className="input-area">
      <form onSubmit={handleSubmit}>
        <input
          className="question-box"
          onChange={handleInputChange}
          value={input}
          placeholder="Ask me ..."
        />
        <input type="submit" className="submit-button" />
      </form>
    </div>
  );
};

const Home = () => {
  const {
    append,
    isLoading,
    messages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat();

  const noMessages = !messages || messages.length === 0;
  const handlePrompt = (promptText) => {
    const msg: Message = {
      id: crypto.randomUUID(),
      content: promptText,
      role: "user",
    };
    append(msg);
  };

  return (
    <main>
      <div className="chat-container">
        <section className={noMessages ? "" : "populated"}>
          {noMessages ? (
            <>
              <p className="starter-text">Welcome to RAGSearch!</p>
              <PromptSuggestionRow onPromptClick={handlePrompt} />
            </>
          ) : (
            <>
              {messages.map((message, index) => (
                <Bubble key={`message-${index}`} message={message} />
              ))}
              {isLoading && <LoadingBubble />}
            </>
          )}
        </section>
        <UserInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      </div>
    </main>
  );
};

export default Home;