import ChatStore from '../Stores/ChatStore';

class InputTypingManager {
    constructor(chatId){
        this.actions = new Map();
        this.timerId = null;
        this.chatId = chatId;

        this.handleTimer = this.handleTimer.bind(this);
        this.addAction = this.addAction.bind(this);
        this.clearAction = this.clearAction.bind(this);
        this.setActionsTimeout = this.setActionsTimeout.bind(this);
    }

    handleTimer(){
        let now = new Date();
        let expiredActions = [];
        for (let [key, value] of this.actions){
            let actionTimeout = value.expire - now;
            if (actionTimeout <= 0) expiredActions.push(key);
        }

        for (let key of expiredActions){
            this.actions.delete(key);
        }

        ChatStore.updateChatTyping(this.chatId);

        this.setActionsTimeout();
    }

    addAction(userId, action){
        let expire = new Date();
        expire.setSeconds(expire.getSeconds() + 8);

        this.actions.set(userId, {expire: expire, action: action});

        if (this.timerId){
            clearTimeout(this.timerId);
        }

        ChatStore.updateChatTyping(this.chatId);

        this.setActionsTimeout();
    }

    setActionsTimeout(){
        let now = new Date();
        let timeout = 1000000;
        for (let [key, value] of this.actions){
            let actionTimeout = value.expire - now;
            if (actionTimeout < timeout) timeout = actionTimeout;
            if (timeout < 0) timeout = 0;
        }

        if (timeout < 1000000){
            this.timerId = setTimeout(this.handleTimer, timeout);
        }
    }

    clearAction(userId){
        this.actions.delete(userId);

        if (this.timerId){
            clearTimeout(this.timerId);
        }

        this.setActionsTimeout();
    }
}

export default InputTypingManager;