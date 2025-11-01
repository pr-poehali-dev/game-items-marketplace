import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { ItemCard } from '@/components/marketplace/ItemCard';

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

interface MarketplaceContentProps {
  items: Item[];
  searchQuery: string;
  userId: number | null;
  onSearchChange: (value: string) => void;
  onBuyItem: (itemId: number, price: string) => void;
  onOpenChat: (itemId: number) => void;
}

export const MarketplaceContent = ({
  items,
  searchQuery,
  userId,
  onSearchChange,
  onBuyItem,
  onOpenChat
}: MarketplaceContentProps) => {
  const categories = [
    { value: 'all', label: 'Все', icon: 'Grid3x3' },
    { value: 'Оружие', label: 'Оружие', icon: 'Sword' },
    { value: 'Броня', label: 'Броня', icon: 'Shield' },
    { value: 'Аксессуары', label: 'Аксессуары', icon: 'Gem' },
    { value: 'Ресурсы', label: 'Ресурсы', icon: 'Package' }
  ];

  const filteredItems = (category: string) => {
    let filtered = items;
    
    if (category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          placeholder="Поиск предметов..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} className="gap-2">
              <Icon name={cat.icon as any} size={16} />
              <span className="hidden sm:inline">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.value} value={cat.value}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems(cat.value).map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  userId={userId}
                  onBuy={() => onBuyItem(item.id, item.price)}
                  onChat={() => onOpenChat(item.id)}
                />
              ))}
            </div>
            {filteredItems(cat.value).length === 0 && (
              <div className="text-center py-12">
                <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Предметов не найдено</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
