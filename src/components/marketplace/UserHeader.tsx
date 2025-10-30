import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface UserBalance {
  id: number;
  username: string;
  balance: string;
}

interface UserHeaderProps {
  balance: UserBalance | null;
  onOpenBalanceDialog: () => void;
  onOpenWithdrawDialog: () => void;
  onOpenReferralDialog: () => void;
  onFetchReferralData: () => void;
  onOpenProfile: () => void;
  onOpenChats: () => void;
  onOpenSales: () => void;
  unreadChatsCount?: number;
  onLogout: () => void;
}

export const UserHeader = ({ 
  balance, 
  onOpenBalanceDialog, 
  onOpenWithdrawDialog, 
  onOpenReferralDialog,
  onFetchReferralData,
  onOpenProfile,
  onOpenChats,
  onOpenSales,
  unreadChatsCount = 0,
  onLogout
}: UserHeaderProps) => {
  return (
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
            
            <Button
              variant="outline"
              size="icon"
              className="border-primary/50 hover:glow-effect relative"
              onClick={onOpenChats}
            >
              <Icon name="MessageCircle" size={20} />
              {unreadChatsCount > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                >
                  {unreadChatsCount}
                </Badge>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-primary/50 hover:glow-effect">
                  <Icon name="Menu" size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-primary/30">
                <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onOpenProfile}>
                  <Icon name="User" size={16} className="mr-2" />
                  Профиль
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onOpenSales}>
                  <Icon name="TrendingUp" size={16} className="mr-2" />
                  Мои продажи
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onOpenBalanceDialog}>
                  <Icon name="CreditCard" size={16} className="mr-2" />
                  Купить балы
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onOpenWithdrawDialog}>
                  <Icon name="Banknote" size={16} className="mr-2" />
                  Вывести балы
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  onFetchReferralData();
                  onOpenReferralDialog();
                }}>
                  <Icon name="Users" size={16} className="mr-2" />
                  Пригласить друга
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                  <Icon name="LogOut" size={16} className="mr-2" />
                  Выход из аккаунта
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};