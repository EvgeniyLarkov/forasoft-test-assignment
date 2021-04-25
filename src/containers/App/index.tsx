import React, { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { MessageInterface } from "../../../server/types";
import Chat from "../Chat";
import Media from "../Media";
import styles from "./styles.css";
import useSockets from "./useSockets";

const WelcomeContainer = ({
    setName,
}: {
    setName: (value: string) => void;
}) => {
    const [input, setInput] = useState("");

    const handleSubmit = (ev: FormEvent) => {
        ev.preventDefault();
        if (input !== "") {
            setName(input);
        }
    };

    const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setInput(ev.target.value);
    };

    return (
        <div className={styles.welcome}>
            <form className="pure-form" onSubmit={handleSubmit}>
                <fieldset className="pure-group">
                    <input
                        type="text"
                        className="pure-input-1"
                        placeholder="Enter your name"
                        value={input}
                        onChange={handleChange}
                    />
                    <button
                        type="submit"
                        className="pure-button pure-input-1 pure-button-primary"
                    >
                        Sign in
                    </button>
                </fieldset>
            </form>
        </div>
    );
};

const App: React.FC = () => {
    const [users, setUsers] = useState<string[]>([]);
    const [name, setName] = useState<string | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [messages, setMessages] = useState<MessageInterface[]>([]);

    const [sendMessage, joinRoom] = useSockets(setUsers, setMessages, setRoomId);

    useEffect(() => {
        const path = window.location.pathname.slice(1);
        if (path.length > 0) {
            setRoomId(path);
        }
    }, [])

    useEffect(() => {
        if (name !== null) {
            joinRoom(name, roomId ?? '');
        }
    }, [name])

    useEffect(() => {
        if (roomId !== null) {
            const newURL = new URL(roomId, window.location.origin).toString();
            window.history.replaceState(null, '', newURL);
        }
    }, [roomId])

    const handleSendMessage = useCallback(sendMessage(name ?? '', roomId ?? ''), [name, roomId]);

    return (
        <main className="pure-g">
            {name === null ? (
                <WelcomeContainer setName={setName} />
            ) : (
                <>
                    <div className="pure-u-1">
                        <h2 className={styles.label}>
                            {`Room: ${roomId}`}
                        </h2>
                    </div>
                    <div className="pure-u-1-2">
                        <h2 className={styles.label}>Users</h2>
                        <Media users={users} />
                    </div>
                    <div className="pure-u-1-2">
                        <h2 className={styles.label}>Chat</h2>
                        <Chat
                            messages={messages}
                            sendMessage={handleSendMessage}
                        />
                    </div>
                </>
            )}
        </main>
    );
};

export default App;
