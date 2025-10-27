import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Transaction {
  id: number;
  item_title: string;
  item_image: string;
  price: number;
  buyer_name: string;
  seller_name: string;
  status: 'pending' | 'seller_confirmed' | 'completed' | 'cancelled';
  created_at: string;
  buyer_id: number;
  seller_id: number;
}

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  currentUserId: number;
  onConfirmDelivery: (transactionId: number) => void;
  onConfirmReceived: (transactionId: number) => void;
  onCancelTransaction: (transactionId: number) => void;
}

export const TransactionDialog = ({
  open,
  onOpenChange,
  transaction,
  currentUserId,
  onConfirmDelivery,
  onConfirmReceived,
  onCancelTransaction
}: TransactionDialogProps) => {
  if (!transaction) return null;

  const isBuyer = transaction.buyer_id === currentUserId;
  const isSeller = transaction.seller_id === currentUserId;

  const getStatusBadge = () => {
    switch (transaction.status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Ожидает отправки</Badge>;
      case 'seller_confirmed':
        return <Badge className="bg-blue-500">Товар отправлен</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Завершена</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Отменена</Badge>;
    }
  };

  const getStatusMessage = () => {
    if (transaction.status === 'pending' && isSeller) {
      return 'Передайте товар покупателю и подтвердите отправку';
    }
    if (transaction.status === 'seller_confirmed' && isBuyer) {
      return 'Подтвердите получение товара';
    }
    if (transaction.status === 'completed') {
      return 'Сделка успешно завершена! Деньги переведены продавцу.';
    }
    return 'Ожидайте действий от другой стороны';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-primary/30 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Детали сделки</DialogTitle>
          <DialogDescription>Информация о покупке</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <img 
              src={transaction.item_image} 
              alt={transaction.item_title}
              className="w-20 h-20 object-cover rounded-lg border-2 border-primary/30"
            />
            <div className="flex-1">
              <h3 className="font-bold text-lg">{transaction.item_title}</h3>
              <p className="text-2xl font-bold text-primary">{transaction.price} ⚡</p>
            </div>
            {getStatusBadge()}
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Покупатель:</span>
              <span className="font-semibold">{transaction.buyer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Продавец:</span>
              <span className="font-semibold">{transaction.seller_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Дата:</span>
              <span className="font-semibold">{new Date(transaction.created_at).toLocaleString('ru-RU')}</span>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="Shield" size={20} className="text-blue-500 mt-1" />
              <div>
                <p className="font-semibold text-blue-500 mb-1">Безопасная сделка</p>
                <p className="text-sm text-muted-foreground">{getStatusMessage()}</p>
              </div>
            </div>
          </div>

          {transaction.status === 'pending' && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="Clock" size={20} className="text-yellow-500 mt-1" />
                <div>
                  <p className="font-semibold text-yellow-500 mb-1">Деньги заморожены</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.price} балов заморожены до завершения сделки. 
                    Они будут переведены продавцу после подтверждения получения товара.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {transaction.status === 'pending' && isSeller && (
            <>
              <Button
                variant="outline"
                onClick={() => onCancelTransaction(transaction.id)}
              >
                Отменить сделку
              </Button>
              <Button
                onClick={() => onConfirmDelivery(transaction.id)}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <Icon name="Check" size={18} className="mr-2" />
                Я передал товар
              </Button>
            </>
          )}

          {transaction.status === 'seller_confirmed' && isBuyer && (
            <>
              <Button
                variant="outline"
                onClick={() => onCancelTransaction(transaction.id)}
              >
                Не получил товар
              </Button>
              <Button
                onClick={() => onConfirmReceived(transaction.id)}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <Icon name="Check" size={18} className="mr-2" />
                Я получил товар
              </Button>
            </>
          )}

          {(transaction.status === 'completed' || transaction.status === 'cancelled' || 
            (transaction.status === 'pending' && isBuyer) ||
            (transaction.status === 'seller_confirmed' && isSeller)) && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Закрыть
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
