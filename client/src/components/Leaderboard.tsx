import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Medal, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface LeaderboardEntry {
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    role: string;
  };
  totalSales: number;
  salesCount: number;
}

interface LeaderboardProps {
  campaignId: string;
}

export function Leaderboard({ campaignId }: LeaderboardProps) {
  const { toast } = useToast();

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["/api/campaigns", campaignId, "leaderboard"],
    enabled: !!campaignId,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">{position}</span>;
    }
  };

  const getRankEmoji = (position: number) => {
    switch (position) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return position.toString();
    }
  };

  const getRankBgColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500";
      case 2:
        return "bg-gray-50 dark:bg-gray-900/20 border-l-4 border-gray-400";
      case 3:
        return "bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-600";
      default:
        return "bg-muted/30";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏆 Ranking de Vendedores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div>
                  <div className="w-24 h-4 bg-muted rounded" />
                  <div className="w-16 h-3 bg-muted rounded mt-1" />
                </div>
              </div>
              <div className="text-right">
                <div className="w-20 h-4 bg-muted rounded" />
                <div className="w-16 h-3 bg-muted rounded mt-1" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!campaignId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏆 Ranking de Vendedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Selecione uma campanha para ver o ranking
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏆 Ranking de Vendedores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {leaderboard.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma venda registrada ainda
          </p>
        ) : (
          leaderboard.map((entry, index) => {
            const position = index + 1;
            return (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-4 rounded-lg transition-colors ${getRankBgColor(position)}`}
                data-testid={`leaderboard-entry-${position}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8">
                    {position <= 3 ? (
                      <span className="text-2xl">{getRankEmoji(position)}</span>
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">
                        {position}
                      </span>
                    )}
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={entry.user.profileImageUrl} />
                    <AvatarFallback>
                      {entry.user.firstName?.[0]}
                      {entry.user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold" data-testid={`text-seller-name-${position}`}>
                      {entry.user.firstName} {entry.user.lastName}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {entry.user.role === 'admin' ? 'Administrador' : 'Vendedor'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg" data-testid={`text-sales-amount-${position}`}>
                    R$ {entry.totalSales.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid={`text-sales-count-${position}`}>
                    {entry.salesCount} vendas
                  </p>
                </div>
                {position === 1 && (
                  <div className="ml-4 animate-bounce">
                    <span className="text-2xl">📱</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
