import { StateInterface, UsersInterface } from "./types";

class State {
    state: StateInterface;
    users: { [x: string]: UsersInterface };

    constructor() {
        this.state = {};
        this.users = {};
    }

    createRoom(roomId: string) {
        this.state[roomId] = {
            messages: [],
            userIds: []
        }
    };

    getRoom(roomId: string) {
        return this.state[roomId];
    }

    hasRoom(roomId: string) {
        return this.state[roomId] !== undefined;
    }

    hasUser(userId: string) {
        const userData = this.users[userId];
        if (!userData) {
            return false;
        }
        return this.state[userData.roomId].userIds.includes(userId);
    }

    getUser(userId: string) {
        return this.users[userId];
    }

    getUserRoom(userId: string) {
        return this.users[userId].roomId;
    }

    removeRoom(roomId: string) {
        delete this.state[roomId];
    }

    addMessage(roomId: string, username: string, message: string, date: string) {
        this.state[roomId].messages.push({ username, message, date })
    }

    addUser(roomId: string, user: UsersInterface) {
        this.users[user.id] = { ...user, roomId };
        this.state[roomId].userIds.push(user.id)
    }

    removeUser(userId: string) {
        if (!this.users[userId]) {
            return false;
        }
        const { roomId } = this.users[userId];
        delete this.users[userId];

        const users = this.state[roomId].userIds;
        const userIndex = users.indexOf(userId);
        if(userIndex !== -1) {
            users.splice(userIndex, 1);
            return true;
        }
        return false;
    }
}

export default State;
