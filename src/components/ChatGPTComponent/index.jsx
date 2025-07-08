import React, {useRef, useState} from 'react';
import axios from 'axios';

const ChatGPTComponent = () => {
    const [input, setInput] = useState('');
    const [reply, setReply] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const cooldownRef = useRef(false); // dùng để ngăn spam khi 429

    const handleSend = async () => {
        if (!input.trim()) {
            setReply('Vui lòng nhập nội dung.');
            return;
        }

        if (isLoading) return; // ngăn gửi khi đang load
        if (cooldownRef.current) {
            setReply('Bạn đang gửi quá nhanh, vui lòng đợi một chút.');
            return;
        }

        setIsLoading(true);
        setReply('Đang xử lý...');

        try {
            const res = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {role: 'system', content: 'Bạn là một trợ lý thông minh.'},
                        {role: 'user', content: input}
                    ],
                    temperature: 0.7
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        // **LƯU Ý**: Nên lưu API key ở backend, không để ở frontend như này:
                        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`

                    }
                }
            );

            const gptReply = res.data.choices[0].message.content;
            setReply(gptReply);
        } catch (err) {
            console.error('Chi tiết lỗi:', err.response?.data || err.message);

            if (err.response?.status === 429) {
                setReply('Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau 10 giây.');
                cooldownRef.current = true;

                // block gửi tiếp trong 10 giây nếu lỗi 429
                setTimeout(() => {
                    cooldownRef.current = false;
                    setReply('');
                }, 10000);
            } else if (err.response?.status === 401) {
                setReply('API key không hợp lệ hoặc đã hết hạn.');
            } else {
                setReply('Lỗi gọi API.');
            }
        } finally {
            setIsLoading(false);
        }

    };

    return (
        <div style={{padding: 20}}>
            <h2>Chat với GPT</h2>
            <textarea
                rows={4}
                cols={50}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi..."
                disabled={isLoading || cooldownRef.current}
            />
            <br/>
            <button
                onClick={handleSend}
                disabled={isLoading || cooldownRef.current}
                style={{marginTop: 10}}
            >
                {isLoading ? 'Đang gửi...' : cooldownRef.current ? 'Vui lòng chờ...' : 'Gửi'}
            </button>
            <div style={{marginTop: 20}}>
                <strong>Phản hồi:</strong>
                <p style={{whiteSpace: 'pre-wrap'}}>{reply}</p>
            </div>
        </div>
    );
};

export default ChatGPTComponent;
