import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface WheelOfFortuneProps {
  userId: number | null;
  onBalanceUpdate: () => void;
}

const PRIZES = [10, 25, 50, 100, 5, 75, 15, 200];
const WHEEL_COLORS = [
  'from-red-500 to-red-600',
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600',
  'from-yellow-500 to-yellow-600',
  'from-purple-500 to-purple-600',
  'from-pink-500 to-pink-600',
  'from-orange-500 to-orange-600',
  'from-cyan-500 to-cyan-600'
];

export const WheelOfFortune = ({ userId, onBalanceUpdate }: WheelOfFortuneProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [canSpin, setCanSpin] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!userId) return;

    const lastSpinTime = localStorage.getItem(`lastSpin_${userId}`);
    if (lastSpinTime) {
      const elapsed = Date.now() - parseInt(lastSpinTime);
      const cooldown = 3 * 60 * 60 * 1000;
      
      if (elapsed < cooldown) {
        setCanSpin(false);
        updateTimeLeft(cooldown - elapsed);
      }
    }
  }, [userId]);

  useEffect(() => {
    if (!canSpin) {
      const interval = setInterval(() => {
        const lastSpinTime = localStorage.getItem(`lastSpin_${userId}`);
        if (lastSpinTime) {
          const elapsed = Date.now() - parseInt(lastSpinTime);
          const cooldown = 3 * 60 * 60 * 1000;
          
          if (elapsed >= cooldown) {
            setCanSpin(true);
            setTimeLeft('');
            clearInterval(interval);
          } else {
            updateTimeLeft(cooldown - elapsed);
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [canSpin, userId]);

  const updateTimeLeft = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    setTimeLeft(`${hours}ч ${minutes}м ${seconds}с`);
  };

  const spinWheel = async () => {
    if (!canSpin || isSpinning || !userId) return;

    setIsSpinning(true);
    
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const prize = PRIZES[prizeIndex];
    
    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = 360 * 5 + (prizeIndex * segmentAngle) + (segmentAngle / 2);
    const finalRotation = rotation + targetAngle;
    
    setRotation(finalRotation);

    setTimeout(async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/5d283741-7051-4c0d-8033-2f8a18947876', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            amount: prize
          })
        });

        if (response.ok) {
          toast.success(`Поздравляем! Вы выиграли ${prize} балов! 🎉`);
          localStorage.setItem(`lastSpin_${userId}`, Date.now().toString());
          setCanSpin(false);
          onBalanceUpdate();
        } else {
          toast.error('Ошибка при начислении приза');
        }
      } catch (error) {
        toast.error('Ошибка соединения');
      }
      
      setIsSpinning(false);
    }, 4000);
  };

  return (
    <Card className="border-primary/30 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Icon name="Trophy" className="text-primary" />
          Колесо фортуны
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full aspect-square max-w-[300px] mx-auto">
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name="ChevronDown" size={48} className="text-primary z-10 -translate-y-[150px]" />
          </div>
          
          <div 
            className="w-full h-full rounded-full relative overflow-hidden shadow-2xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
            }}
          >
            {PRIZES.map((prize, index) => {
              const angle = (360 / PRIZES.length) * index;
              return (
                <div
                  key={index}
                  className={`absolute w-full h-full bg-gradient-to-br ${WHEEL_COLORS[index]}`}
                  style={{
                    clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((angle + 360 / PRIZES.length - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle + 360 / PRIZES.length - 90) * Math.PI / 180)}%)`
                  }}
                >
                  <div
                    className="absolute text-white font-bold text-lg"
                    style={{
                      top: '20%',
                      left: '50%',
                      transform: `rotate(${angle + 360 / PRIZES.length / 2}deg) translateX(-50%)`,
                      transformOrigin: 'center center'
                    }}
                  >
                    {prize}
                  </div>
                </div>
              );
            })}
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-card border-4 border-primary shadow-xl flex items-center justify-center">
                <Icon name="Sparkles" className="text-primary" size={32} />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-3">
          {canSpin ? (
            <Button
              onClick={spinWheel}
              disabled={isSpinning}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-effect"
              size="lg"
            >
              {isSpinning ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" />
                  Крутится...
                </>
              ) : (
                <>
                  <Icon name="Play" className="mr-2" />
                  Крутить колесо
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                disabled
                className="w-full"
                variant="outline"
                size="lg"
              >
                <Icon name="Clock" className="mr-2" />
                Следующая попытка через: {timeLeft}
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
            {PRIZES.map((prize, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${WHEEL_COLORS[i]}`} />
                {prize}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
