import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import { toast } from 'sonner';
import { WheelOfFortune } from '@/components/marketplace/WheelOfFortune';

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
  onBalanceUpdate: () => void;
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
  onCopyReferralLink,
  onBalanceUpdate
}: PaymentDialogsProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showSbpPayment, setShowSbpPayment] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  const handleSbpPayment = async () => {
    if (!selectedAmount) {
      toast.error('Выберите сумму пополнения');
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/4e343123-9c61-4d72-b4ae-6a6b08c425ee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedAmount,
          userId: balance?.id
        })
      });

      const data = await response.json();

      if (data.qrCode && data.paymentId) {
        setQrCodeImage(data.qrCode);
        setPaymentId(data.paymentId);
        setShowSbpPayment(true);
        toast.success('Сканируйте QR-код для оплаты');
        startPaymentCheck(data.paymentId, selectedAmount);
      } else {
        toast.error('Ошибка создания платежа');
      }
    } catch (error) {
      toast.error('Ошибка при создании платежа СБП');
    }
  };

  const startPaymentCheck = (paymentId: string, amount: number) => {
    setIsCheckingPayment(true);
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `https://functions.poehali.dev/5d283741-7051-4c0d-8033-2f8a18947876?user_id=${balance?.id}`,
          { headers: { 'X-User-Id': String(balance?.id) } }
        );
        const data = await response.json();
        
        if (data.balance && parseFloat(data.balance) >= parseFloat(balance?.balance || '0') + amount) {
          clearInterval(checkInterval);
          setIsCheckingPayment(false);
          toast.success(`Оплата получена! Начислено ${amount} баллов`);
          setShowSbpPayment(false);
          setQrCodeImage(null);
          setSelectedAmount(null);
          onOpenBalanceDialogChange(false);
          window.location.reload();
        }
      } catch (error) {
        console.error('Error checking payment:', error);
      }
    }, 3000);

    setTimeout(() => {
      clearInterval(checkInterval);
      setIsCheckingPayment(false);
    }, 300000);
  };

  return (
    <>
      <Dialog open={openBalanceDialog} onOpenChange={onOpenBalanceDialogChange}>
        <DialogContent className="bg-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Купить балы</DialogTitle>
            <DialogDescription>Выберите пакет для пополнения баланса</DialogDescription>
          </DialogHeader>
          
          {!showSbpPayment ? (
            <>
              <div className="grid grid-cols-2 gap-4 py-4">
                {[100, 500, 1000, 5000].map((amount) => (
                  <Card 
                    key={amount}
                    className={`cursor-pointer hover:scale-105 transition-all hover:glow-effect border-primary/30 ${
                      selectedAmount === amount ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedAmount(amount)}
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
              
              {selectedAmount && (
                <div className="space-y-3">
                  <div className="bg-muted/30 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">К оплате</p>
                    <p className="text-3xl font-bold text-primary">{selectedAmount} балов</p>
                    <p className="text-lg text-accent">{(selectedAmount / 10).toFixed(0)} руб</p>
                  </div>
                  
                  <Button 
                    onClick={handleSbpPayment}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-effect"
                    size="lg"
                  >
                    <Icon name="Smartphone" size={20} className="mr-2" />
                    Получить QR-код для оплаты
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4 py-4">
              <div className="bg-muted/30 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">К оплате</p>
                <p className="text-3xl font-bold text-primary">{selectedAmount} балов</p>
                <p className="text-lg text-accent">{(selectedAmount! / 10).toFixed(0)} руб</p>
              </div>

              {qrCodeImage && (
                <div className="bg-white p-4 rounded-lg">
                  <img 
                    src={`data:image/png;base64,${qrCodeImage}`} 
                    alt="QR код для оплаты"
                    className="w-full max-w-[280px] mx-auto"
                  />
                </div>
              )}

              <div className="bg-primary/10 p-3 rounded-lg flex gap-2">
                <Icon name="Smartphone" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">Как оплатить:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Откройте приложение банка</li>
                    <li>Найдите оплату по СБП</li>
                    <li>Отсканируйте QR-код</li>
                    <li>Подтвердите платёж</li>
                  </ol>
                  <p className="mt-2 text-secondary font-semibold">
                    Номер карты: 2200700628083809
                  </p>
                </div>
              </div>

              {isCheckingPayment && (
                <div className="bg-secondary/10 p-3 rounded-lg flex items-center gap-2">
                  <Icon name="Loader2" size={16} className="text-secondary animate-spin" />
                  <p className="text-xs text-muted-foreground">
                    Ожидаем подтверждения оплаты... Баллы начислятся автоматически.
                  </p>
                </div>
              )}

              <Button 
                variant="outline" 
                onClick={() => {
                  setShowSbpPayment(false);
                  setQrCodeImage(null);
                  setSelectedAmount(null);
                  setIsCheckingPayment(false);
                }}
                className="w-full"
              >
                Закрыть
              </Button>
            </div>
          )}
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
            
            <WheelOfFortune 
              userId={balance?.id || null}
              onBalanceUpdate={onBalanceUpdate}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};