import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface NewItem {
  title: string;
  description: string;
  price: string;
  category: string;
  rarity: string;
  image_url: string;
}

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newItem: NewItem;
  onItemChange: (item: NewItem) => void;
  onCreateItem: () => void;
}

export const CreateItemDialog = ({ 
  open, 
  onOpenChange, 
  newItem, 
  onItemChange, 
  onCreateItem 
}: CreateItemDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-primary/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Выставить предмет на продажу</DialogTitle>
          <DialogDescription>Заполните информацию о предмете</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название предмета</Label>
              <Input
                id="title"
                placeholder="Легендарный меч"
                value={newItem.title}
                onChange={(e) => onItemChange({...newItem, title: e.target.value})}
                className="border-border/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Цена (балы)</Label>
              <Input
                id="price"
                type="number"
                placeholder="1000"
                value={newItem.price}
                onChange={(e) => onItemChange({...newItem, price: e.target.value})}
                className="border-border/50"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Мощное оружие с уникальными характеристиками..."
              value={newItem.description}
              onChange={(e) => onItemChange({...newItem, description: e.target.value})}
              className="border-border/50 min-h-[100px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Select 
                value={newItem.category} 
                onValueChange={(value) => onItemChange({...newItem, category: value})}
              >
                <SelectTrigger className="border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Оружие">Оружие</SelectItem>
                  <SelectItem value="Броня">Броня</SelectItem>
                  <SelectItem value="Скины">Скины</SelectItem>
                  <SelectItem value="Аксессуары">Аксессуары</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rarity">Редкость</Label>
              <Select 
                value={newItem.rarity} 
                onValueChange={(value) => onItemChange({...newItem, rarity: value})}
              >
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image_url">Ссылка на изображение</Label>
            <Input
              id="image_url"
              placeholder="https://..."
              value={newItem.image_url}
              onChange={(e) => onItemChange({...newItem, image_url: e.target.value})}
              className="border-border/50"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button 
            onClick={onCreateItem}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-effect"
          >
            <Icon name="Check" size={18} className="mr-2" />
            Выставить на продажу
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
