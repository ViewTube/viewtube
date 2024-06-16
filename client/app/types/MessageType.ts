export type MessageType = {
  id: number;
  type: 'info' | 'error';
  title: string;
  message: string;
  clickAction?: () => void | Promise<void>;
  dismissed: boolean;
  dismissDelay?: number;
};
