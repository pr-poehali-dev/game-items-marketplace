import { CreateItemDialog } from '@/components/marketplace/CreateItemDialog';
import { PaymentDialogs } from '@/components/marketplace/PaymentDialogs';
import { ProfileDialog } from '@/components/profile/ProfileDialog';
import { ChatsDialog } from '@/components/marketplace/ChatsDialog';
import { TransactionDialog } from '@/components/marketplace/TransactionDialog';
import { MySalesDialog } from '@/components/marketplace/MySalesDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WheelOfFortune } from '@/components/marketplace/WheelOfFortune';

interface DialogsContainerProps {
  openDialog: boolean;
  openBalanceDialog: boolean;
  openWithdrawDialog: boolean;
  openReferralDialog: boolean;
  openProfileDialog: boolean;
  openChatsDialog: boolean;
  openTransactionDialog: boolean;
  openSalesDialog: boolean;
  openWheelDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  setOpenBalanceDialog: (open: boolean) => void;
  setOpenWithdrawDialog: (open: boolean) => void;
  setOpenReferralDialog: (open: boolean) => void;
  setOpenProfileDialog: (open: boolean) => void;
  setOpenChatsDialog: (open: boolean) => void;
  setOpenTransactionDialog: (open: boolean) => void;
  setOpenSalesDialog: (open: boolean) => void;
  setOpenWheelDialog: (open: boolean) => void;
  newItem: any;
  setNewItem: (item: any) => void;
  handleCreateItem: () => void;
  handleTopUp: (amount: number) => void;
  withdrawAmount: string;
  setWithdrawAmount: (amount: string) => void;
  paymentDetails: string;
  setPaymentDetails: (details: string) => void;
  handleWithdraw: () => void;
  referralData: any;
  copyReferralLink: () => void;
  userProfile: any;
  handleSaveProfile: (profile: any) => void;
  chats: any[];
  selectedChatId: number | null;
  setSelectedChatId: (id: number | null) => void;
  messages: any[];
  handleSendMessage: (text: string) => void;
  selectedTransaction: any;
  mySalesItems: any[];
  totalEarned: number;
  balance: any;
  onBalanceUpdate: () => void;
  userId: number | null;
}

export const DialogsContainer = ({
  openDialog,
  openBalanceDialog,
  openWithdrawDialog,
  openReferralDialog,
  openProfileDialog,
  openChatsDialog,
  openTransactionDialog,
  openSalesDialog,
  openWheelDialog,
  setOpenDialog,
  setOpenBalanceDialog,
  setOpenWithdrawDialog,
  setOpenReferralDialog,
  setOpenProfileDialog,
  setOpenChatsDialog,
  setOpenTransactionDialog,
  setOpenSalesDialog,
  setOpenWheelDialog,
  newItem,
  setNewItem,
  handleCreateItem,
  handleTopUp,
  withdrawAmount,
  setWithdrawAmount,
  paymentDetails,
  setPaymentDetails,
  handleWithdraw,
  referralData,
  copyReferralLink,
  userProfile,
  handleSaveProfile,
  chats,
  selectedChatId,
  setSelectedChatId,
  messages,
  handleSendMessage,
  selectedTransaction,
  mySalesItems,
  totalEarned,
  balance,
  onBalanceUpdate,
  userId
}: DialogsContainerProps) => {
  return (
    <>
      <CreateItemDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        newItem={newItem}
        setNewItem={setNewItem}
        onSubmit={handleCreateItem}
      />

      <PaymentDialogs
        openBalanceDialog={openBalanceDialog}
        setOpenBalanceDialog={setOpenBalanceDialog}
        openWithdrawDialog={openWithdrawDialog}
        setOpenWithdrawDialog={setOpenWithdrawDialog}
        openReferralDialog={openReferralDialog}
        setOpenReferralDialog={setOpenReferralDialog}
        onTopUp={handleTopUp}
        withdrawAmount={withdrawAmount}
        setWithdrawAmount={setWithdrawAmount}
        paymentDetails={paymentDetails}
        setPaymentDetails={setPaymentDetails}
        onWithdraw={handleWithdraw}
        referralData={referralData}
        onCopyReferralLink={copyReferralLink}
        balance={balance}
        onBalanceUpdate={onBalanceUpdate}
      />

      <ProfileDialog
        open={openProfileDialog}
        onOpenChange={setOpenProfileDialog}
        profile={userProfile}
        onSave={handleSaveProfile}
      />

      <ChatsDialog
        open={openChatsDialog}
        onOpenChange={setOpenChatsDialog}
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
        messages={messages}
        onSendMessage={handleSendMessage}
      />

      <TransactionDialog
        open={openTransactionDialog}
        onOpenChange={setOpenTransactionDialog}
        transaction={selectedTransaction}
      />

      <MySalesDialog
        open={openSalesDialog}
        onOpenChange={setOpenSalesDialog}
        salesItems={mySalesItems}
        totalEarned={totalEarned}
      />

      <Dialog open={openWheelDialog} onOpenChange={setOpenWheelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Колесо фортуны</DialogTitle>
          </DialogHeader>
          <WheelOfFortune userId={userId} onBalanceUpdate={onBalanceUpdate} />
        </DialogContent>
      </Dialog>
    </>
  );
};