import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const MARKETPLACE_URL = 'https://functions.poehali.dev/df4a99c9-f7a8-4c3f-ad77-c7a1d451aed9';
  const BALANCE_URL = 'https://functions.poehali.dev/5d283741-7051-4c0d-8033-2f8a18947876';

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
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleTopUp(100)} 
                  variant="outline" 
                  className="border-primary/50 hover:bg-primary/10 hover:glow-effect transition-all"
                >
                  +100
                </Button>
                <Button 
                  onClick={() => handleTopUp(500)} 
                  className="bg-primary hover:bg-primary/90 glow-effect transition-all"
                >
                  +500
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold mb-2 text-glow">Витрина предметов</h2>
          <p className="text-muted-foreground text-lg">Покупай и продавай игровые вещи за балы</p>
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