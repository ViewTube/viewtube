import { defineStore } from 'pinia';

type MessageType = {
  id: number;
  type: 'info' | 'error';
  title: string;
  message: string;
  clickAction?: () => void | Promise<void>;
  dismissed: boolean;
  dismissDelay?: number;
};

export const useMessagesStore = defineStore('messages', {
  state: () => ({
    messages: [] as MessageType[]
  }),

  getters: {
    allMessages: state => state.messages,
    visibleMessages: state => state.messages.filter(el => el.dismissed === false)
  },

  actions: {
    addMessage(message: MessageType) {
      this.messages.push(message);
    },
    dismissMessage(id: number) {
      this.messages.find(m => m.id === id).dismissed = true;
    },
    createMessage(messageData: Omit<MessageType, 'dismissed' | 'id'>) {
      this.addMessage({
        ...messageData,
        id: this.allMessages.length + 1,
        dismissed: false
      });
    }
  }
});
