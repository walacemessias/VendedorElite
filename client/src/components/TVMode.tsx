import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X, Trophy, Crown, Medal, TrendingUp, Target, Star } from "lucide-react";
import { Confetti } from "./Confetti";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { NotificationPopup } from "./NotificationPopup";

interface TVModeProps {
  campaignId: string;
  onExit: () => void;
}

export function TVMode({ campaignId, onExit }: TVModeProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);
  const { playCelebrationSound, playNotificationSound } = useSoundEffects();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/campaigns", campaignId, "leaderboard"],
    enabled: !!campaignId,
    refetchInterval: 5000, // Refresh every 5 seconds in TV mode
  });

  const { data: campaign } = useQuery({
    queryKey: ["/api/campaigns", campaignId],
    enabled: !!campaignId,
  });

  // WebSocket connection for real-time celebration triggers
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const socket = new WebSocket(wsUrl);
      
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'NEW_SALE') {
          // Trigger confetti celebration
          setShowConfetti(true);
          playCelebrationSound();
          setNotification({
            title: `🎉 Nova Venda!`,
            message: `${message.sellerName} acabou de realizar uma venda de R$ ${message.amount.toLocaleString('pt-BR')}!`
          });
          setTimeout(() => {
            setShowConfetti(false);
            setNotification(null);
          }, 5000);
        }
      };
      
      return () => {
        socket.close();
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }, [playCelebrationSound]);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-12 w-12 text-yellow-500" />;
      case 2:
        return <Medal className="h-10 w-10 text-gray-400" />;
      case 3:
        return <Medal className="h-10 w-10 text-amber-600" />;
      default:
        return <Star className="h-8 w-8 text-primary" />;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "from-yellow-500/20 to-yellow-500/5 border-yellow-500/50";
      case 2:
        return "from-gray-400/20 to-gray-400/5 border-gray-400/50";
      case 3:
        return "from-amber-600/20 to-amber-600/5 border-amber-600/50";
      default:
        return "from-primary/20 to-primary/5 border-primary/50";
    }
  };

  const top3 = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3, 10);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-muted/20 to-background z-50" data-testid="tv-mode-overlay">
      {showConfetti && <Confetti />}
      
      {notification && (
        <NotificationPopup
          title={notification.title}
          message={notification.message}
          type="sale"
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="h-full flex flex-col">
        {/* TV Mode Header */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-primary p-6 relative shadow-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-5xl"
              >
                {campaign?.prizeEmoji || "🏆"}
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-primary-foreground">
                  {campaign?.name || "RANKING DE VENDAS"}
                </h1>
                <p className="text-xl text-primary-foreground/90 mt-1">
                  🎁 Prêmio: {campaign?.prizeDescription || "A definir"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right text-primary-foreground">
                <p className="text-3xl font-bold">
                  {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-lg opacity-90">
                  {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <Button
                onClick={onExit}
                variant="destructive"
                size="lg"
                data-testid="button-exit-tv"
              >
                <X className="mr-2 h-5 w-5" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* TV Mode Content */}
        <div className="flex-1 p-8 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-6 mb-6 h-[60%]">
              {top3.map((entry: any, index: number) => {
                const position = index + 1;
                return (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className={`relative ${position === 1 ? 'transform scale-110 z-10' : ''}`}
                  >
                    <Card className={`h-full bg-gradient-to-br ${getPositionColor(position)} border-2 shadow-xl`}>
                      <CardContent className="flex flex-col items-center justify-center h-full p-6">
                        {/* Position Icon */}
                        <motion.div
                          animate={{ 
                            rotate: position === 1 ? [0, 10, -10, 0] : 0,
                            scale: position === 1 ? [1, 1.1, 1] : 1
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3
                          }}
                        >
                          {getPositionIcon(position)}
                        </motion.div>

                        {/* Seller Avatar and Name */}
                        <div className="mt-4 text-center">
                          <Avatar className="h-24 w-24 border-4 border-background shadow-lg mx-auto">
                            <AvatarImage src={entry.user.profileImageUrl} />
                            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/60">
                              {entry.user.firstName?.[0]}{entry.user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <h2 className="text-2xl font-bold mt-3">
                            {entry.user.firstName} {entry.user.lastName}
                          </h2>
                          <Badge className="mt-2" variant="secondary">
                            {entry.user.role === 'admin' ? 'Gerente' : 'Vendedor'}
                          </Badge>
                        </div>

                        {/* Sales Stats */}
                        <div className="mt-6 space-y-3 w-full">
                          <div className="bg-background/50 rounded-lg p-3 text-center">
                            <p className="text-sm text-muted-foreground">Total de Vendas</p>
                            <p className="text-3xl font-bold text-primary">
                              R$ {entry.totalSales.toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <div className="bg-background/50 rounded-lg p-2 flex-1 text-center">
                              <p className="text-xs text-muted-foreground">Vendas</p>
                              <p className="text-xl font-bold">{entry.salesCount}</p>
                            </div>
                            <div className="bg-background/50 rounded-lg p-2 flex-1 text-center">
                              <p className="text-xs text-muted-foreground">Ticket Médio</p>
                              <p className="text-xl font-bold">
                                R$ {Math.round(entry.totalSales / entry.salesCount).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Achievement Badge */}
                        {position === 1 && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="mt-4"
                          >
                            <Badge className="text-lg px-4 py-1" variant="default">
                              🔥 Em chamas!
                            </Badge>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Rest of Leaderboard */}
            <Card className="h-[35%]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Próximas Posições
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {restOfLeaderboard.map((entry: any, index: number) => {
                    const position = index + 4;
                    return (
                      <div
                        key={entry.userId}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="px-2 py-1">
                            {position}°
                          </Badge>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={entry.user.profileImageUrl} />
                            <AvatarFallback className="text-sm">
                              {entry.user.firstName?.[0]}{entry.user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">
                              {entry.user.firstName} {entry.user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {entry.salesCount} vendas
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-primary">
                          R$ {entry.totalSales.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}