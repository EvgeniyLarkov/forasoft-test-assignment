import React from 'react';
import { UsersClientInterface } from '../../../server/types';
import style from './styles.css';

// const CardColors = ['slateblue', 'royalblue', 'crimson', 'palegreen', 'purple', 'indianred'];

interface MediaProps {
    users: UsersClientInterface[],
    isCapturing: boolean,
    handleVideoStart: (x: boolean) => void,
    provideRef: (id: string, node: HTMLVideoElement | null) => void
}

const Media: React.FC<MediaProps> = ({
    users, provideRef, handleVideoStart, isCapturing
}) => {
    const handleButtonClick = (ev: React.MouseEvent<HTMLElement>) => {
        handleVideoStart(!isCapturing);
    }
    console.log(users);
    return (<>
        <div className={style.root}>
            {users.map(user => <div className={style.card} key={user.id}>
                <video
                    ref={instance => provideRef(user.id, instance)}
                />
                <span>{user.username}</span>
            </div>)
            }
        </div>
        <div className={style.control}>
            <button
                onClick={handleButtonClick}
                className="pure-button pure-button-primary"
            >
                {`${isCapturing ? 'Stop' : 'Start'} video`}
            </button>
        </div>
    </>)
}

export default Media;