import React from 'react';
import { UsersClientInterface } from '../../../server/types';
import style from './styles.css';

// const CardColors = ['slateblue', 'royalblue', 'crimson', 'palegreen', 'purple', 'indianred'];

interface MediaProps {
    users: UsersClientInterface[],
}

const Media: React.FC<MediaProps> = ({
    users
}) => {
    return (<>
        <div className={style.root}>
            {users.map(user => <div className={style.card} key={user.id}>
                <span>{user.username}</span>
            </div>)
            }
        </div>
    </>)
}

export default Media;