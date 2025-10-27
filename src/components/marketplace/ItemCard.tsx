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

interface ItemCardProps {
  item: Item;
  index: number;
  onBuyItem: (item: Item) => void;
}

const getRarityColor = (rarity: string) => {
  const colors: Record<string, string> = {
    'Легендарный': 'bg-primary text-primary-foreground glow-effect',
    'Эпический': 'bg-secondary text-secondary-foreground glow-effect-cyan',
    'Редкий': 'bg-accent text-accent-foreground',
    'Обычный': 'bg-muted text-muted-foreground'
  };
  return colors[rarity] || 'bg-muted text-muted-foreground';
};

export const ItemCard = ({ item, index, onBuyItem }: ItemCardProps) => {
  return (
    <Card 
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
          onClick={() => onBuyItem(item)}
        >
          <Icon name="ShoppingCart" size={18} className="mr-2" />
          Купить
        </Button>
      </CardFooter>
    </Card>
  );
};