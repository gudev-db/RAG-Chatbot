// import { title } from "process";
import "./global.css";

export const metadata = {
    title: "PokeRAG",
    description: "RAG Chatbot for Pokemon stuff",
}

const Rootlayout = ({ children }) => {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}

export default Rootlayout;