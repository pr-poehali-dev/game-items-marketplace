import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface Chat {
  id: number;
  transaction_id: number;
  item_title: string;
  other_user_name: string;
  last_message: string;
  unread_count: number;
  updated_at: string;
}

interface Message {
  id: number;
  sender_name: string;
  message: string;
  created_at: string;
  is_own: boolean;
}

interface ChatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chats: Chat[];
  selectedChatId: number | null;
  messages: Message[];
  onSelectChat: (chatId: number) => void;
  onSendMessage: (transactionId: number, message: string) => void;
  onOpenTransaction: (transactionId: number) => void;
}

export const ChatsDialog = ({
  open,
  onOpenChange,
  chats,
  selectedChatId,
  messages,
  onSelectChat,
  onSendMessage,
  onOpenTransaction
}: ChatsDialogProps) => {
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChatId) return;
    
    const selectedChat = chats.find(c => c.id === selectedChatId);
    if (selectedChat) {
      onSendMessage(selectedChat.transaction_id, messageText);
      setMessageText('');
    }
  };

  const selectedChat = chats.find(c => c.id === selectedChatId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-primary/30 max-w-4xl h-[600px] p-0">
        <div className="flex h-full">
          <div className="w-1/3 border-r border-border/50">
            <DialogHeader className="p-4 border-b border-border/50">
              <DialogTitle className="text-xl text-primary">Чаты</DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="h-[calc(600px-80px)]">
              <div className="p-2 space-y-2">
                {chats.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="MessageCircle" size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Нет активных чатов</p>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => onSelectChat(chat.id)}
                      className={`w-full text-left p-3 rounded-lg hover:bg-primary/5 transition-colors ${
                        selectedChatId === chat.id ? 'bg-primary/10 border border-primary/30' : 'border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-semibold text-sm">{chat.other_user_name}</span>
                        {chat.unread_count > 0 && (
                          <Badge className="bg-red-500 text-white h-5 min-w-5 flex items-center justify-center p-1">
                            {chat.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{chat.item_title}</p>
                      <p className="text-xs text-muted-foreground truncate">{chat.last_message}</p>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{selectedChat.other_user_name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedChat.item_title}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenTransaction(selectedChat.transaction_id)}
                  >
                    <Icon name="Eye" size={16} className="mr-2" />
                    Детали сделки
                  </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.is_own ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.is_own
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {!msg.is_own && (
                            <p className="text-xs font-semibold mb-1">{msg.sender_name}</p>
                          )}
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.is_own ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('ru-RU', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-border/50">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Напишите сообщение..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    >
                      <Icon name="Send" size={18} />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Icon name="MessageCircle" size={64} className="mx-auto mb-4 opacity-30" />
                  <p>Выберите чат для начала общения</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
