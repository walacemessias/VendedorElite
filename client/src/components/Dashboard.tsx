import { useQuery } from "@tanstack/react-query";
import type { Campaign } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Target, 
  Users, 
  Percent,
  Plus,
  Minus,
  Tv,
  DollarSign
} from "lucide-react";
import { useLocation } from "wouter";
import { CampaignSelector } from "./CampaignSelector";
import { Leaderboard } from "./Leaderboard";
import { SaleModal } from "./SaleModal";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface DashboardStats {
  monthSales: number;
  monthTarget: number;
  activeSellers: number;
  conversionRate: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [subtractionModalOpen, setSubtractionModalOpen] = useState(false);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log('Connected to WebSocket');
      };
      
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'NEW_SALE') {
          // Show celebration for new sales
          toast({
            title: "🎉 Nova Venda!",
            description: `${message.data.amount} - ${message.data.customerName}`,
          });
          
          // Refetch data to update dashboard
          // This would trigger re-fetching of campaigns and leaderboard
        }
      };
      
      socket.onclose = () => {
        console.log('Disconnected from WebSocket');
      };
      
      return () => {
        socket.close();
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }, [toast]);

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  // Set default campaign when campaigns load
  useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  // Mock stats for now - in real app, this would come from API
  const stats: DashboardStats = {
    monthSales: 485200,
    monthTarget: 620000,
    activeSellers: 24,
    conversionRate: 32.8
  };

  const targetPercentage = (stats.monthSales / stats.monthTarget) * 100;

  if (campaignsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="flex gap-4">
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Campaign Selector */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Dashboard de Vendas</h1>
          <CampaignSelector
            campaigns={campaigns}
            selectedCampaignId={selectedCampaignId}
            onCampaignChange={setSelectedCampaignId}
            data-testid="campaign-selector"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setSaleModalOpen(true)}
            className="bg-green-600 text-white hover:bg-green-700"
            data-testid="button-launch-sale"
          >
            <Plus className="mr-2 h-4 w-4" />
            Lançar Venda
          </Button>
          
          <Button 
            onClick={() => setSubtractionModalOpen(true)}
            variant="destructive"
            size="icon"
            data-testid="button-subtract-sale"
            title="Subtrair Venda"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setLocation('/tv')}
            data-testid="button-tv-mode"
          >
            <Tv className="mr-2 h-4 w-4" />
            Modo TV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vendas do Mês
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-month-sales">
              R$ {stats.monthSales.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-primary">
              ↗ +12.5% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Meta do Mês
            </CardTitle>
            <Target className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-target-percentage">
              {targetPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              R$ {stats.monthTarget.toLocaleString('pt-BR')} objetivo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vendedores Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-sellers">
              {stats.activeSellers}
            </div>
            <p className="text-xs text-primary">
              +3 novos este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversão
            </CardTitle>
            <Percent className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-conversion-rate">
              {stats.conversionRate}%
            </div>
            <p className="text-xs text-primary">
              ↗ +2.1% vs média
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <Leaderboard 
            campaignId={selectedCampaignId}
            data-testid="leaderboard"
          />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔔 Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">Carlos Silva</span> fechou uma venda de{" "}
                    <span className="font-semibold text-primary">R$ 8.500</span>
                  </p>
                  <p className="text-xs text-muted-foreground">há 5 minutos</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">Ana Santos</span> alcançou a meta mensal
                  </p>
                  <p className="text-xs text-muted-foreground">há 1 hora</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    Novo vendedor <span className="font-semibold">Lucas Ferreira</span> foi adicionado
                  </p>
                  <p className="text-xs text-muted-foreground">há 2 horas</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="h-4 w-4 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    Nova campanha <span className="font-semibold">"Verão 2024"</span> criada
                  </p>
                  <p className="text-xs text-muted-foreground">ontem</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sale Modal */}
      <SaleModal
        open={saleModalOpen}
        onOpenChange={setSaleModalOpen}
        campaignId={selectedCampaignId}
        data-testid="sale-modal"
      />
      
      {/* Subtraction Modal */}
      <SaleModal
        open={subtractionModalOpen}
        onOpenChange={setSubtractionModalOpen}
        campaignId={selectedCampaignId}
        isSubtraction={true}
        data-testid="subtraction-modal"
      />
    </div>
  );
}
