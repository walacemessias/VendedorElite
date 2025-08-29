import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Trophy, Target } from 'lucide-react';

interface NotificationPopupProps {
  title: string;
  message: string;
  type?: 'sale' | 'achievement' | 'goal';
  onClose?: () => void;
}

export function NotificationPopup({ 
  title, 
  message, 
  type = 'sale',
  onClose 
}: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-5 w-5 text-amber-500" />;
      case 'goal':
        return <Target className="h-5 w-5 text-blue-500" />;
      default:
        return <TrendingUp className="h-5 w-5 text-green-500" />;
    }
  };

  const getColorClass = () => {
    switch (type) {
      case 'achievement':
        return 'border-amber-500 bg-amber-50 dark:bg-amber-950/20';
      case 'goal':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
      default:
        return 'border-green-500 bg-green-50 dark:bg-green-950/20';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border-l-4 p-4 shadow-lg ${getColorClass()}`}
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-sm text-muted-foreground mt-1">{message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}