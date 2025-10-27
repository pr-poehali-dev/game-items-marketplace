import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { UserHeader } from '@/components/marketplace/UserHeader';
import { ItemCard } from '@/components/marketplace/ItemCard';
import { CreateItemDialog } from '@/components/marketplace/CreateItemDialog';
import { PaymentDialogs } from '@/components/marketplace/PaymentDialogs';

interface Item {
  id: number;
  title: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
  rarity: string;
  seller_name: string;
}

interface UserBalance {
  id: number;
  username: string;
  balance: string;
}

const Index = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBalanceDialog, setOpenBalanceDialog] = useState(false);
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [openReferralDialog, setOpenReferralDialog] = useState(false);
  const [referralData, setReferralData] = useState<any>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Оружие',
    rarity: 'Обычный',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400'
  });

  const MARKETPLACE_URL = 'https://functions.poehali.dev/df4a99c9-f7a8-4c3f-ad77-c7a1d451aed9';
  const BALANCE_URL = 'https://functions.poehali.dev/5d283741-7051-4c0d-8033-2f8a18947876';
  const WITHDRAW_URL = 'https://functions.poehali.dev/d8001bff-bd17-4f41-9fc2-19526a5d5ea6';
  const REFERRAL_URL = 'https://functions.poehali.dev/fa6fc18d-d38b-44fe-8ca0-36ba45768277';
  const PAYMENT_URL = 'https://functions.poehali.dev/07e4cb43-0a4e-457b-a9f9-05daf5d0022c';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, balanceRes] = await Promise.all([
        fetch(MARKETPLACE_URL),
        fetch(`${BALANCE_URL}?user_id=1`)
      ]);

      const itemsData = await itemsRes.json();
      const balanceData = await balanceRes.json();

      setItems(itemsData.items || []);
      setBalance(balanceData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async (amount: number) => {
    try {
      const res = await fetch(PAYMENT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1,
          amount: amount
        })
      });

      const data = await res.json();
      
      if (data.payment_url) {
        window.open(data.payment_url, '_blank');
        toast.success(`Переходим к оплате ${amount} балов (${data.price_rub} руб)`);
        
        setTimeout(() => {
          fetchData();
        }, 3000);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Ошибка создания платежа');
    }
  };

  const handleCreateItem = async () => {
    if (!newItem.title || !newItem.price) {
      toast.error('Заполните название и цену');
      return;
    }

    try {
      const res = await fetch(MARKETPLACE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seller_id: 1,
          title: newItem.title,
          description: newItem.description,
          price: parseFloat(newItem.price),
          category: newItem.category,
          rarity: newItem.rarity,
          image_url: newItem.image_url
        })
      });

      if (res.ok) {
        toast.success('Предмет выставлен на продажу!');
        setOpenDialog(false);
        setNewItem({
          title: '',
          description: '',
          price: '',
          category: 'Оружие',
          rarity: 'Обычный',
          image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400'
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Ошибка создания предмета');
    }
  };

  const fetchReferralData = async () => {
    try {
      const res = await fetch(`${REFERRAL_URL}?user_id=1`);
      const data = await res.json();
      setReferralData(data);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Укажите корректную сумму');
      return;
    }

    try {
      const res = await fetch(WITHDRAW_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1,
          amount: parseFloat(withdrawAmount),
          payment_method: 'card',
          payment_details: paymentDetails
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success('Заявка на вывод создана! Обработка займет 1-3 дня');
        setOpenWithdrawDialog(false);
        setWithdrawAmount('');
        setPaymentDetails('');
        fetchData();
      } else {
        toast.error(data.error || 'Ошибка вывода средств');
      }
    } catch (error) {
      console.error('Error withdrawing:', error);
      toast.error('Ошибка вывода средств');
    }
  };

  const copyReferralLink = () => {
    if (referralData?.referral_code) {
      const link = `${window.location.origin}?ref=${referralData.referral_code}`;
      navigator.clipboard.writeText(link);
      toast.success('Реферальная ссылка скопирована!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-glow-pulse text-4xl font-bold text-primary">
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <UserHeader 
        balance={balance}
        onOpenBalanceDialog={() => setOpenBalanceDialog(true)}
        onOpenWithdrawDialog={() => setOpenWithdrawDialog(true)}
        onOpenReferralDialog={() => setOpenReferralDialog(true)}
        onFetchReferralData={fetchReferralData}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold mb-2 text-glow">Маркетплейс</h2>
            <p className="text-muted-foreground">Покупай и продавай игровые предметы</p>
          </div>
          
          <Button 
            onClick={() => setOpenDialog(true)}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-effect animate-glow-pulse"
          >
            <Icon name="Plus" size={20} className="mr-2" />
            Продать предмет
          </Button>
          
          <CreateItemDialog 
            open={openDialog}
            onOpenChange={setOpenDialog}
            newItem={newItem}
            onItemChange={setNewItem}
            onCreateItem={handleCreateItem}
          />
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Grid3x3" size={16} className="mr-2" />
              Все
            </TabsTrigger>
            <TabsTrigger value="weapons" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Roblox</TabsTrigger>
            <TabsTrigger value="armor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Shield" size={16} className="mr-2" />
              Броня
            </TabsTrigger>
            <TabsTrigger value="skins" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Palette" size={16} className="mr-2" />
              Скины
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, index) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="weapons" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.filter(item => item.category === 'Оружие').map((item, index) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="armor" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.filter(item => item.category === 'Броня').map((item, index) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="skins" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.filter(item => item.category === 'Скины').map((item, index) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <PaymentDialogs 
        openBalanceDialog={openBalanceDialog}
        onOpenBalanceDialogChange={setOpenBalanceDialog}
        openWithdrawDialog={openWithdrawDialog}
        onOpenWithdrawDialogChange={setOpenWithdrawDialog}
        openReferralDialog={openReferralDialog}
        onOpenReferralDialogChange={setOpenReferralDialog}
        balance={balance}
        withdrawAmount={withdrawAmount}
        onWithdrawAmountChange={setWithdrawAmount}
        paymentDetails={paymentDetails}
        onPaymentDetailsChange={setPaymentDetails}
        referralData={referralData}
        onTopUp={handleTopUp}
        onWithdraw={handleWithdraw}
        onCopyReferralLink={copyReferralLink}
      />

      <footer className="border-t border-border/50 mt-16 py-8 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Icon name="Sparkles" size={16} className="text-primary" />
            Gaming Marketplace - Покупай, продавай, побеждай!
            <Icon name="Sparkles" size={16} className="text-secondary" />
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;