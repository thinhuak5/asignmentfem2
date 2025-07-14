import React, {useState} from 'react';
import {GoogleGenerativeAI} from '@google/generative-ai';

const ChatGNMComponent = () => {
    const [input, setInput] = useState('');
    const [reply, setReply] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

    const handleSend = async () => {
        if (!input.trim()) {
            setReply('Vui lòng nhập nội dung.');
            return;
        }

        if (!API_KEY) {
            setReply('API key chưa được cung cấp!');
            return;
        }

        setIsLoading(true);
        setReply('Đang xử lý...');

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);

            // ✅ Cập nhật model chính xác
            const model = genAI.getGenerativeModel({model: 'gemini-1.5-pro'});

            const result = await model.generateContent(input);
            const response = await result.response;
            const text = response.text();

            setReply(text);
        } catch (err) {
            console.error('Lỗi gọi Gemini:', err);
            setReply(`Lỗi khi gọi Gemini API: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{padding: 20}}>
            <h2>Chat với Gemini</h2>
            <textarea
                rows={4}
                cols={50}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi..."
            />
            <br/>
            <button onClick={handleSend} disabled={isLoading}>
                {isLoading ? 'Đang gửi...' : 'Gửi'}
            </button>
            <div style={{marginTop: 20}}>
                <strong>Phản hồi:</strong>
                <p style={{whiteSpace: 'pre-wrap'}}>{reply}</p>
            </div>
        </div>
    );
};

export default ChatGNMComponent;
