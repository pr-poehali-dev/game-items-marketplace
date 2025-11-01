import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserHeader } from '@/components/marketplace/UserHeader';
import { MarketplaceContent } from '@/components/marketplace/MarketplaceContent';
import { DialogsContainer } from '@/components/marketplace/DialogsContainer';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openBalanceDialog, setOpenBalanceDialog] = useState(false);
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [openReferralDialog, setOpenReferralDialog] = useState(false);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [openChatsDialog, setOpenChatsDialog] = useState(false);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [openSalesDialog, setOpenSalesDialog] = useState(false);
  const [mySalesItems, setMySalesItems] = useState<any[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [referralData, setReferralData] = useState<any>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState({
    username: '',
    email: '',
    avatar: '',
    bio: '',
    balance: 0
  });
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
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUserId(user.id);
      fetchData(user.id);
    }
  }, []);

  const fetchData = async (currentUserId?: number) => {
    const uid = currentUserId || userId;
    if (!uid) return;
    
    try {
      const [itemsRes, balanceRes] = await Promise.all([
        fetch(MARKETPLACE_URL),
        fetch(`${BALANCE_URL}?user_id=${uid}`)
      ]);

      const itemsData = await itemsRes.json();
      const balanceData = await balanceRes.json();

      setItems(itemsData.items || []);
      setBalance(balanceData);
      setUserProfile({
        username: balanceData.username || '',
        email: balanceData.email || '',
        avatar: balanceData.profile_avatar || '',
        bio: balanceData.bio || '',
        balance: parseFloat(balanceData.balance || '0')
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async (amount: number) => {
    try {
      if (!userId) return;
      
      const res = await fetch(PAYMENT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
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
      if (!userId) return;
      
      const res = await fetch(MARKETPLACE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seller_id: userId,
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
    if (!userId) return;
    
    try {
      const res = await fetch(`${REFERRAL_URL}?user_id=${userId}`);
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
      if (!userId) return;
      
      const res = await fetch(WITHDRAW_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
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

  const handleSaveProfile = async (updatedProfile: any) => {
    if (!userId) return;
    
    try {
      const res = await fetch(BALANCE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          username: updatedProfile.username,
          email: updatedProfile.email,
          profile_avatar: updatedProfile.avatar,
          bio: updatedProfile.bio
        })
      });

      if (res.ok) {
        toast.success('Профиль обновлен!');
        setOpenProfileDialog(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Ошибка обновления профиля');
    }
  };

  const handleBuyItem = async (itemId: number, price: string) => {
    if (!userId || !balance) return;

    const itemPrice = parseFloat(price);
    const userBalance = parseFloat(balance.balance);

    if (userBalance < itemPrice) {
      toast.error('Недостаточно средств на балансе');
      setOpenBalanceDialog(true);
      return;
    }

    try {
      const res = await fetch(`${MARKETPLACE_URL}/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer_id: userId,
          status: 'sold'
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Покупка успешна! Предмет добавлен в инвентарь');
        setSelectedTransaction(data.transaction);
        setOpenTransactionDialog(true);
        fetchData();
      } else {
        toast.error(data.error || 'Ошибка покупки');
      }
    } catch (error) {
      console.error('Error buying item:', error);
      toast.error('Ошибка покупки предмета');
    }
  };

  const handleOpenChat = async (itemId: number) => {
    if (!userId) return;
    
    setOpenChatsDialog(true);
    
    try {
      const res = await fetch(`${MARKETPLACE_URL}/chats?user_id=${userId}`);
      const data = await res.json();
      setChats(data.chats || []);
      
      const existingChat = data.chats.find((c: any) => c.item_id === itemId);
      if (existingChat) {
        setSelectedChatId(existingChat.id);
        fetchMessages(existingChat.id);
      } else {
        const createRes = await fetch(`${MARKETPLACE_URL}/chats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_id: itemId, buyer_id: userId })
        });
        const newChat = await createRes.json();
        setChats([...data.chats, newChat]);
        setSelectedChatId(newChat.id);
        fetchMessages(newChat.id);
      }
    } catch (error) {
      console.error('Error opening chat:', error);
    }
  };

  const fetchMessages = async (chatId: number) => {
    try {
      const res = await fetch(`${MARKETPLACE_URL}/messages?chat_id=${chatId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedChatId || !userId) return;

    try {
      await fetch(`${MARKETPLACE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: selectedChatId,
          sender_id: userId,
          message: text
        })
      });

      fetchMessages(selectedChatId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleOpenMySales = async () => {
    if (!userId) return;
    
    setOpenSalesDialog(true);
    
    try {
      const res = await fetch(`${MARKETPLACE_URL}/my-sales?seller_id=${userId}`);
      const data = await res.json();
      setMySalesItems(data.items || []);
      setTotalEarned(data.total_earned || 0);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <UserHeader
          balance={balance}
          onAddBalance={() => setOpenBalanceDialog(true)}
          onWithdraw={() => setOpenWithdrawDialog(true)}
          onReferral={() => {
            fetchReferralData();
            setOpenReferralDialog(true);
          }}
          onProfile={() => setOpenProfileDialog(true)}
          onCreateItem={() => setOpenDialog(true)}
          onOpenChats={() => {
            if (userId) {
              fetch(`${MARKETPLACE_URL}/chats?user_id=${userId}`)
                .then(res => res.json())
                .then(data => {
                  setChats(data.chats || []);
                  setOpenChatsDialog(true);
                });
            }
          }}
          onOpenSales={handleOpenMySales}
        />

        <MarketplaceContent
          items={items}
          searchQuery={searchQuery}
          userId={userId}
          onSearchChange={setSearchQuery}
          onBuyItem={handleBuyItem}
          onOpenChat={handleOpenChat}
        />

        <DialogsContainer
          openDialog={openDialog}
          openBalanceDialog={openBalanceDialog}
          openWithdrawDialog={openWithdrawDialog}
          openReferralDialog={openReferralDialog}
          openProfileDialog={openProfileDialog}
          openChatsDialog={openChatsDialog}
          openTransactionDialog={openTransactionDialog}
          openSalesDialog={openSalesDialog}
          setOpenDialog={setOpenDialog}
          setOpenBalanceDialog={setOpenBalanceDialog}
          setOpenWithdrawDialog={setOpenWithdrawDialog}
          setOpenReferralDialog={setOpenReferralDialog}
          setOpenProfileDialog={setOpenProfileDialog}
          setOpenChatsDialog={setOpenChatsDialog}
          setOpenTransactionDialog={setOpenTransactionDialog}
          setOpenSalesDialog={setOpenSalesDialog}
          newItem={newItem}
          setNewItem={setNewItem}
          handleCreateItem={handleCreateItem}
          handleTopUp={handleTopUp}
          withdrawAmount={withdrawAmount}
          setWithdrawAmount={setWithdrawAmount}
          paymentDetails={paymentDetails}
          setPaymentDetails={setPaymentDetails}
          handleWithdraw={handleWithdraw}
          referralData={referralData}
          copyReferralLink={copyReferralLink}
          userProfile={userProfile}
          handleSaveProfile={handleSaveProfile}
          chats={chats}
          selectedChatId={selectedChatId}
          setSelectedChatId={setSelectedChatId}
          messages={messages}
          handleSendMessage={handleSendMessage}
          selectedTransaction={selectedTransaction}
          mySalesItems={mySalesItems}
          totalEarned={totalEarned}
        />
      </div>
    </div>
  );
};

export default Index;
