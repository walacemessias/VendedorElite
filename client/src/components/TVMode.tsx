import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { Confetti } from "./Confetti";
import { useState, useEffect } from "react";

interface TVModeProps {
  campaignId: string;
  onExit: () => void;
}

export function TVMode({ campaignId, onExit }: TVModeProps) {
  const [showConfetti, setShowConfetti] = useState(false);

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
          setTimeout(() => setShowConfetti(false), 5000);
        }
      };
      
      return () => {
        socket.close();
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-background z-50" data-testid="tv-mode-overlay">
      {showConfetti && <Confetti />}
      
      <div className="h-full flex flex-col">
        {/* TV Mode Header */}
        <div className="bg-primary p-6 text-center relative">
          <h1 className="text-4xl font-bold text-primary-foreground">
            🏆 RANKING DE VENDAS 🏆
          </h1>
          <p className="text-xl text-primary-foreground mt-2">
            {campaign?.name} - {campaign?.prizeDescription}
          </p>
          
          <Button
            onClick={onExit}
            variant="destructive"
            className="absolute top-4 right-4"
            data-testid="button-exit-tv"
          >
            <X className="mr-2 h-4 w-4" />
            Sair do Modo TV
          </Button>
        </div>

        {/* TV Mode Content */}
        <div className="flex-1 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* Leaderboard */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold">
                    🥇 TOP VENDEDORES
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {leaderboard.slice(0, 5).map((entry: any, index: number) => {
                    const position = index + 1;
                    const getRankEmoji = (pos: number) => {
                      switch (pos) {
                        case 1: return "🥇";
                        case 2: return "🥈";
                        case 3: return "🥉";
                        default: return pos.toString();
                      }
                    };

                    const getBgClass = (pos: number) => {
                      switch (pos) {
                        case 1: return "bg-yellow-50 dark:bg-yellow-900/20";
                        case 2: return "bg-gray-50 dark:bg-gray-900/20";
                        case 3: return "bg-amber-50 dark:bg-amber-900/20";
                        default: return "bg-muted/30";
                      }
                    };

                    return (
                      <div
                        key={entry.userId}
                        className={`flex items-center justify-between p-6 rounded-lg ${getBgClass(position)}`}
                        data-testid={`tv-leaderboard-entry-${position}`}
                      >
                        <div className="flex items-center space-x-6">
                          <span className="text-4xl">{getRankEmoji(position)}</span>
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={entry.user.profileImageUrl} />
                            <AvatarFallback className="text-xl">
                              {entry.user.firstName?.[0]}
                              {entry.user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-2xl font-bold">
                              {entry.user.firstName} {entry.user.lastName}
                            </h3>
                            <p className="text-lg text-muted-foreground">
                              {entry.user.role === 'admin' ? 'Gerente de Vendas' : 'Vendedor'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-primary">
                            R$ {entry.totalSales.toLocaleString('pt-BR')}
                          </p>
                          <p className="text-lg text-muted-foreground">
                            {entry.salesCount} vendas
                          </p>
                        </div>
                        {position === 1 && campaign?.prizeEmoji && (
                          <div className="ml-6 animate-bounce">
                            <span className="text-4xl">{campaign.prizeEmoji}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart & Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    📊 VENDAS DIÁRIAS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Simplified chart representation */}
                    <div className="flex items-end justify-between h-40 gap-2">
                      {[45000, 52000, 38000, 61000, 48000].map((value, index) => {
                        const height = (value / 61000) * 100;
                        const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
                        return (
                          <div key={index} className="flex flex-col items-center gap-2">
                            <div
                              className="bg-primary rounded-t w-12 transition-all duration-1000"
                              style={{ height: `${height}%` }}
                            />
                            <span className="text-sm font-medium">{days[index]}</span>
                            <span className="text-xs text-muted-foreground">
                              {(value / 1000).toFixed(0)}k
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">
                    🎯 META DO MÊS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">78%</div>
                    <p className="text-muted-foreground">R$ 485.2K de R$ 620K</p>
                    <div className="w-full bg-muted rounded-full h-4 mt-4">
                      <div 
                        className="bg-primary h-4 rounded-full transition-all duration-1000"
                        style={{ width: '78%' }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
