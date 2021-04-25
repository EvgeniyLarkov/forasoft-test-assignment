import React from 'react';
import style from './styles.css';

interface UserCardProps {
    name: string,
    active?: boolean,
}

const UserCard: React.FC<UserCardProps> = (props: UserCardProps) =>
    <div className={style.card}><span>{props.name}</span></div>

interface MediaProps {
        users: string[],
}

const Media: React.FC<MediaProps> = ({ users }) => {
    return (
        <div className={style.root}>
            {users.map(user => <UserCard name={user} key={user} />)}
        </div>)
}

export default Media;