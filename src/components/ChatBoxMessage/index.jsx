import React, {useEffect, useRef, useState} from 'react';
import {GoogleGenerativeAI} from '@google/generative-ai';

const ChatBoxMessage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({behavior: 'smooth'});
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {sender: 'user', text: input};
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({model: 'gemini-pro'});

            const result = await model.generateContent(input);
            const response = await result.response;
            const text = response.text();

            const botMessage = {sender: 'bot', text};
            setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
            let message = 'Lỗi không xác định.';
            if (err.message.includes('429')) message = 'Vượt giới hạn. Vui lòng thử sau.';
            if (err.message.includes('API key')) message = 'API key không hợp lệ.';
            setMessages((prev) => [...prev, {sender: 'bot', text: message}]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>💬 Chat với Gemini</h2>
            <div style={styles.chatBox}>
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        style={{
                            ...styles.message,
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            backgroundColor: msg.sender === 'user' ? '#DCF8C6' : '#FFF',
                            borderColor: msg.sender === 'user' ? '#b2e59f' : '#ccc',
                        }}
                    >
                        {msg.text}
                    </div>
                ))}
                {isLoading && <div style={styles.loading}>✍️ Đang trả lời...</div>}
                <div ref={chatEndRef}/>
            </div>

            <div style={styles.inputArea}>
        <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            style={styles.textarea}
            disabled={isLoading}
        />
                <button onClick={handleSend} disabled={isLoading || !input.trim()} style={styles.button}>
                    Gửi
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: 600,
        margin: '0 auto',
        fontFamily: 'sans-serif',
        padding: 20,
        border: '1px solid #ddd',
        borderRadius: 8,
        backgroundColor: '#fafafa',
    },
    header: {
        textAlign: 'center',
    },
    chatBox: {
        height: 400,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 10,
        border: '1px solid #ccc',
        borderRadius: 8,
        backgroundColor: '#f4f4f4',
    },
    message: {
        maxWidth: '70%',
        padding: '8px 12px',
        borderRadius: 12,
        border: '1px solid',
        whiteSpace: 'pre-wrap',
    },
    loading: {
        fontStyle: 'italic',
        color: '#666',
        margin: '5px 0',
    },
    inputArea: {
        marginTop: 10,
        display: 'flex',
        gap: 10,
    },
    textarea: {
        flex: 1,
        padding: 10,
        resize: 'none',
        borderRadius: 6,
        border: '1px solid #ccc',
    },
    button: {
        padding: '10px 20px',
        borderRadius: 6,
        border: 'none',
        backgroundColor: '#2196F3',
        color: '#fff',
        cursor: 'pointer',
    },
};

export default ChatBoxMessage;
