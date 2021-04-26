import React from 'react';
import { UsersClientInterface } from '../../../server/types';
import style from './styles.css';

interface UserCardProps {
    name: string,
    active?: boolean,
}

// const CardColors = ['slateblue', 'royalblue', 'crimson', 'palegreen', 'purple', 'indianred'];

const UserCard: React.FC<UserCardProps> = (props: UserCardProps) =>
    <div className={style.card}><span>{props.name}</span></div>

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

    return (<>
        <div className={style.root}>
            {users.map(user => <>
                <UserCard name={user.username} key={user.id} />
                <video
                    ref={instance => {provideRef(user.id, instance)}}
                    key={`${user.id}_v`}
                    width={'200px'}
                    height={'200px'}
                />
            </>)
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