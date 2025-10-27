import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface UserBalance {
  id: number;
  username: string;
  balance: string;
}

interface ReferralData {
  referral_code: string;
  total_referrals: number;
  total_earned: number;
}

interface PaymentDialogsProps {
  openBalanceDialog: boolean;
  onOpenBalanceDialogChange: (open: boolean) => void;
  openWithdrawDialog: boolean;
  onOpenWithdrawDialogChange: (open: boolean) => void;
  openReferralDialog: boolean;
  onOpenReferralDialogChange: (open: boolean) => void;
  balance: UserBalance | null;
  withdrawAmount: string;
  onWithdrawAmountChange: (amount: string) => void;
  paymentDetails: string;
  onPaymentDetailsChange: (details: string) => void;
  referralData: ReferralData | null;
  onTopUp: (amount: number) => void;
  onWithdraw: () => void;
  onCopyReferralLink: () => void;
}

export const PaymentDialogs = ({
  openBalanceDialog,
  onOpenBalanceDialogChange,
  openWithdrawDialog,
  onOpenWithdrawDialogChange,
  openReferralDialog,
  onOpenReferralDialogChange,
  balance,
  withdrawAmount,
  onWithdrawAmountChange,
  paymentDetails,
  onPaymentDetailsChange,
  referralData,
  onTopUp,
  onWithdraw,
  onCopyReferralLink
}: PaymentDialogsProps) => {
  return (
    <>
      <Dialog open={openBalanceDialog} onOpenChange={onOpenBalanceDialogChange}>
        <DialogContent className="bg-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Купить балы</DialogTitle>
            <DialogDescription>Выберите пакет для пополнения баланса</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            {[100, 500, 1000, 5000].map((amount) => (
              <Card 
                key={amount}
                className="cursor-pointer hover:scale-105 transition-all hover:glow-effect border-primary/30"
                onClick={() => {
                  onTopUp(amount);
                  onOpenBalanceDialogChange(false);
                }}
              >
                <CardContent className="p-6 text-center">
                  <Icon name="Coins" size={32} className="text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold text-primary">{amount}</p>
                  <p className="text-sm text-muted-foreground">балов</p>
                  <p className="text-xs mt-2 text-accent">{(amount / 10).toFixed(0)} руб</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openWithdrawDialog} onOpenChange={onOpenWithdrawDialogChange}>
        <DialogContent className="bg-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Вывод балов</DialogTitle>
            <DialogDescription>
              Выводите балы 1 раз в день. 1 бал = 0.1 руб
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Доступно для вывода</p>
              <p className="text-3xl font-bold text-primary">{balance?.balance} балов</p>
              <p className="text-sm text-accent">≈ {(parseFloat(balance?.balance || '0') * 0.1).toFixed(2)} руб</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="withdraw_amount">Сумма вывода (балы)</Label>
              <Input
                id="withdraw_amount"
                type="number"
                placeholder="100"
                value={withdrawAmount}
                onChange={(e) => onWithdrawAmountChange(e.target.value)}
                className="border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                Минимум 100 балов (10 руб)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment_details">Номер карты</Label>
              <Input
                id="payment_details"
                placeholder="1234 5678 9012 3456"
                value={paymentDetails}
                onChange={(e) => onPaymentDetailsChange(e.target.value)}
                className="border-border/50"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenWithdrawDialogChange(false)}>
              Отмена
            </Button>
            <Button 
              onClick={onWithdraw}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-effect"
            >
              <Icon name="Banknote" size={18} className="mr-2" />
              Вывести
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openReferralDialog} onOpenChange={onOpenReferralDialogChange}>
        <DialogContent className="bg-card border-primary/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Пригласи друга</DialogTitle>
            <DialogDescription>
              Получай 50 балов за каждого приглашенного друга!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6 rounded-lg text-center">
              <Icon name="Gift" size={48} className="text-primary mx-auto mb-3" />
              <p className="text-4xl font-bold text-primary mb-1">50 балов</p>
              <p className="text-sm text-muted-foreground">за каждого друга</p>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Приглашено друзей</span>
                <span className="text-xl font-bold text-primary">{referralData?.total_referrals || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Заработано</span>
                <span className="text-xl font-bold text-secondary">{referralData?.total_earned || 0} балов</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Ваша реферальная ссылка</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={referralData?.referral_code ? `${window.location.origin}?ref=${referralData.referral_code}` : 'Загрузка...'}
                  className="border-border/50"
                />
                <Button 
                  onClick={onCopyReferralLink}
                  variant="outline"
                  className="border-primary/50"
                >
                  <Icon name="Copy" size={18} />
                </Button>
              </div>
            </div>
            
            <div className="bg-accent/10 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 Отправь ссылку другу, и когда он зарегистрируется, вы оба получите бонусы!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
