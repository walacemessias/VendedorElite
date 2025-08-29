import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { TVMode } from "@/components/TVMode";
import { CampaignSelector } from "@/components/CampaignSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Tv } from "lucide-react";
import { Link } from "wouter";

export default function TVModePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [tvModeActive, setTvModeActive] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado. Redirecionando...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: campaigns = [] } = useQuery({
    queryKey: ["/api/campaigns"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando modo TV...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (tvModeActive && selectedCampaignId) {
    return (
      <TVMode
        campaignId={selectedCampaignId}
        onExit={() => setTvModeActive(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Tv className="h-8 w-8 text-primary" />
              Modo TV
            </h1>
            <p className="text-muted-foreground">
              Exiba rankings e celebrações em telas grandes para motivar sua equipe
            </p>
          </div>
        </div>

        {/* Campaign Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Configuração do Modo TV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecione a Campanha</label>
              <CampaignSelector
                campaigns={campaigns}
                selectedCampaignId={selectedCampaignId}
                onCampaignChange={setSelectedCampaignId}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Recursos do Modo TV:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Rankings em tempo real com atualizações automáticas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Celebrações com confetes para novas vendas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Interface otimizada para telas grandes
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Métricas de performance visualizadas
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setTvModeActive(true)}
                disabled={!selectedCampaignId}
                className="flex-1"
                data-testid="button-start-tv-mode"
              >
                <Tv className="mr-2 h-4 w-4" />
                Iniciar Modo TV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {selectedCampaignId && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold mb-2">🏆 RANKING DE VENDAS 🏆</h2>
                <p className="text-muted-foreground mb-4">
                  {campaigns.find(c => c.id === selectedCampaignId)?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Esta é uma prévia de como aparecerá no modo TV
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
