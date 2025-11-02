import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface SaleItem {
  id: number;
  title: string;
  price: string;
  image_url: string;
  category: string;
  rarity: string;
  is_sold: boolean;
  buyer_name?: string;
  sold_at?: string;
  created_at: string;
}

interface MySalesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SaleItem[];
  totalEarned: number;
}

export const MySalesDialog = ({ open, onOpenChange, items, totalEarned }: MySalesDialogProps) => {
  const soldItems = (items || []).filter(item => item.is_sold);
  const activeItems = (items || []).filter(item => !item.is_sold);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="TrendingUp" className="text-primary" />
            Мои продажи
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Icon name="DollarSign" className="text-primary" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Всего заработано</p>
                  <p className="text-2xl font-bold text-primary">{totalEarned.toFixed(2)} ₽</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Icon name="CheckCircle" className="text-green-500" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Продано</p>
                  <p className="text-2xl font-bold text-green-500">{soldItems.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Icon name="Package" className="text-blue-500" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">На продаже</p>
                  <p className="text-2xl font-bold text-blue-500">{activeItems.length}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon name="History" className="text-primary" />
              История продаж
            </h3>
            
            {soldItems.length === 0 ? (
              <Card className="p-8 text-center">
                <Icon name="PackageOpen" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">У вас пока нет проданных предметов</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {soldItems.map(item => (
                  <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.rarity}
                          </Badge>
                        </div>
                        {item.buyer_name && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Покупатель: {item.buyer_name}
                          </p>
                        )}
                        {item.sold_at && (
                          <p className="text-xs text-muted-foreground">
                            {formatDate(item.sold_at)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          +{parseFloat(item.price).toFixed(2)} ₽
                        </p>
                        <Badge className="bg-green-500">
                          <Icon name="CheckCircle" size={12} className="mr-1" />
                          Продано
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon name="ShoppingCart" className="text-blue-500" />
              Активные лоты
            </h3>
            
            {activeItems.length === 0 ? (
              <Card className="p-8 text-center">
                <Icon name="PackagePlus" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">У вас нет активных лотов на продаже</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeItems.map(item => (
                  <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.rarity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Выставлен: {formatDate(item.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {parseFloat(item.price).toFixed(2)} ₽
                        </p>
                        <Badge variant="outline" className="border-blue-500 text-blue-500">
                          <Icon name="Clock" size={12} className="mr-1" />
                          Ожидает
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};