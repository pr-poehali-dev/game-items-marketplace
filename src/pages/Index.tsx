import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

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
      const res = await fetch(BALANCE_URL, {
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
      setBalance(data);
      toast.success(`Баланс пополнен на ${amount} балов!`);
    } catch (error) {
      console.error('Error topping up:', error);
      toast.error('Ошибка пополнения баланса');
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

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      'Легендарный': 'bg-primary text-primary-foreground glow-effect',
      'Эпический': 'bg-secondary text-secondary-foreground glow-effect-cyan',
      'Редкий': 'bg-accent text-accent-foreground',
      'Обычный': 'bg-muted text-muted-foreground'
    };
    return colors[rarity] || 'bg-muted text-muted-foreground';
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
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-effect animate-glow-pulse">
                <Icon name="Gamepad2" size={24} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-glow">GAMING SHOP</h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <Card className="bg-card/50 border-primary/30 backdrop-blur-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  <Icon name="Wallet" size={20} className="text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{balance?.username}</p>
                    <p className="text-xl font-bold text-primary">{balance?.balance} балов</p>
                  </div>
                </CardContent>
              </Card>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-primary/50 hover:glow-effect">
                    <Icon name="Menu" size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-primary/30">
                  <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setOpenBalanceDialog(true)}>
                    <Icon name="CreditCard" size={16} className="mr-2" />
                    Купить балы
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setOpenWithdrawDialog(true)}>
                    <Icon name="Banknote" size={16} className="mr-2" />
                    Вывести балы
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    fetchReferralData();
                    setOpenReferralDialog(true);
                  }}>
                    <Icon name="Users" size={16} className="mr-2" />
                    Пригласить друга
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-bold mb-2 text-glow">Витрина предметов</h2>
            <p className="text-muted-foreground text-lg">Покупай и продавай игровые вещи за балы</p>
          </div>
          
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-effect text-lg px-6 py-6">
                <Icon name="Plus" size={20} className="mr-2" />
                Продать свой предмет
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-primary/30 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl text-primary">Выставить предмет на продажу</DialogTitle>
                <DialogDescription>
                  Заполните информацию о вашем предмете и установите цену
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Название предмета *</Label>
                  <Input
                    id="title"
                    placeholder="Легендарный меч"
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    className="border-border/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    placeholder="Редкий меч с огненным уроном..."
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    className="border-border/50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Цена (балы) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="100"
                      value={newItem.price}
                      onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                      className="border-border/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Категория</Label>
                    <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                      <SelectTrigger className="border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Оружие">Оружие</SelectItem>
                        <SelectItem value="Броня">Броня</SelectItem>
                        <SelectItem value="Зелья">Зелья</SelectItem>
                        <SelectItem value="Аксессуары">Аксессуары</SelectItem>
                        <SelectItem value="Скины">Скины</SelectItem>
                        <SelectItem value="Расходники">Расходники</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rarity">Редкость</Label>
                  <Select value={newItem.rarity} onValueChange={(value) => setNewItem({...newItem, rarity: value})}>
                    <SelectTrigger className="border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Обычный">Обычный</SelectItem>
                      <SelectItem value="Редкий">Редкий</SelectItem>
                      <SelectItem value="Эпический">Эпический</SelectItem>
                      <SelectItem value="Легендарный">Легендарный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image_url">Ссылка на изображение</Label>
                  <Input
                    id="image_url"
                    placeholder="https://..."
                    value={newItem.image_url}
                    onChange={(e) => setNewItem({...newItem, image_url: e.target.value})}
                    className="border-border/50"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Отмена
                </Button>
                <Button 
                  onClick={handleCreateItem}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-effect"
                >
                  <Icon name="Check" size={18} className="mr-2" />
                  Выставить на продажу
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <Card 
              key={item.id} 
              className="group hover:scale-105 transition-all duration-300 hover:glow-effect cursor-pointer bg-card/80 backdrop-blur-sm border-border/50 animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden h-48">
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={getRarityColor(item.rarity)}>
                    {item.rarity}
                  </Badge>
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                    {item.category}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Icon name="User" size={16} />
                  <span>Продавец: {item.seller_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Coins" size={24} className="text-primary" />
                  <span className="text-3xl font-bold text-primary">{item.price}</span>
                  <span className="text-muted-foreground">балов</span>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-effect group-hover:animate-glow-pulse transition-all"
                  onClick={() => toast.success('Функция покупки скоро будет доступна!')}
                >
                  <Icon name="ShoppingCart" size={18} className="mr-2" />
                  Купить
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={openBalanceDialog} onOpenChange={setOpenBalanceDialog}>
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
                  handleTopUp(amount);
                  setOpenBalanceDialog(false);
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

      <Dialog open={openWithdrawDialog} onOpenChange={setOpenWithdrawDialog}>
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
                onChange={(e) => setWithdrawAmount(e.target.value)}
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
                onChange={(e) => setPaymentDetails(e.target.value)}
                className="border-border/50"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenWithdrawDialog(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleWithdraw}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-effect"
            >
              <Icon name="Banknote" size={18} className="mr-2" />
              Вывести
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openReferralDialog} onOpenChange={setOpenReferralDialog}>
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
                  onClick={copyReferralLink}
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