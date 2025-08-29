import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Confetti } from "./Confetti";

interface CelebrationOverlayProps {
  isVisible: boolean;
  saleData?: {
    sellerName: string;
    amount: number;
    customerName?: string;
    productDescription?: string;
  };
  onComplete?: () => void;
}

export function CelebrationOverlay({ 
  isVisible, 
  saleData, 
  onComplete 
}: CelebrationOverlayProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onComplete?.();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          data-testid="celebration-overlay"
        >
          {showConfetti && <Confetti />}
          
          <motion.div
            initial={{ scale: 0.3, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.3, y: 50, opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 15, 
              stiffness: 300,
              delay: 0.1
            }}
            className="bg-card rounded-2xl p-12 text-center max-w-lg mx-4 shadow-2xl border"
          >
            {/* Celebration Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-8xl mb-6"
            >
              🎉
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-primary mb-4"
            >
              NOVA VENDA!
            </motion.h2>

            {/* Sale Details */}
            {saleData && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <p className="text-2xl font-semibold text-foreground">
                  {saleData.sellerName}
                </p>
                <p className="text-3xl font-bold text-primary">
                  R$ {saleData.amount.toLocaleString('pt-BR')}
                </p>
                {saleData.customerName && (
                  <p className="text-lg text-muted-foreground">
                    Cliente: {saleData.customerName}
                  </p>
                )}
                {saleData.productDescription && (
                  <p className="text-base text-muted-foreground">
                    {saleData.productDescription}
                  </p>
                )}
              </motion.div>
            )}

            {/* Success Message */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-muted-foreground mt-6 text-lg"
            >
              🏆 Parabéns pelo fechamento!
            </motion.p>

            {/* Pulsing Ring Effect */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-2xl border-4 border-primary/30 pointer-events-none"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
