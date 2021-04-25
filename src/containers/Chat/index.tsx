import React, { ChangeEvent, FormEvent, useState } from 'react';
import { MessageInterface } from '../../../server/types';
import style from './styles.css';

interface ChatCardProps {
    date: string;
    children: string;
    author: string;
}

const ChatCard = (props: ChatCardProps) =>
    <div className={style.chatcard}>
        <span className={style.chatcard__message}>{props.children}</span>
        <span className={style.chatcard__info}><b>{props.author}</b>{` - ${props.date}`}</span>
    </div>

interface ChatProps {
    messages: MessageInterface[],
    sendMessage: (val: string) => void
}

const Chat: React.FC<ChatProps> = ({
    messages,
    sendMessage
}) => {
    const [input, setInput] = useState('');

    const handleMessageSend = (ev: FormEvent) => {
        ev.preventDefault();
        sendMessage(input);
        setInput('');
    }

    const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setInput(ev.target.value);
    }

    return (
        <div className={style.root}>
            <div className={style.chat}>
                {messages.map((msg) =>
                    <ChatCard date={msg.date}
                        author={msg.username}>
                        {msg.message}
                    </ChatCard>)
                }
            </div>
            <form className="pure-form pure-g" onSubmit={handleMessageSend}>
                <div className="pure-u-3-4">
                    <input
                        type="text"
                        className="pure-input-1"
                        placeholder="Write smth here"
                        value={input}
                        onChange={handleChange}
                    />
                </div>
                <div className="pure-u-1-4">
                    <button
                        type="submit"
                        className="pure-button pure-button-primary pure-input-1"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>)
}

export default Chat;