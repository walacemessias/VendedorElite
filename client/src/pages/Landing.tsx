import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Trophy, Users, BarChart3, Tv, Target } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              VendedorElite
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A plataforma de gamificação de vendas que transforma sua equipe em campeões. 
            Rankings em tempo real, premiações customizáveis e celebrações envolventes.
          </p>
          
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg" 
            className="text-lg px-8 py-6"
            data-testid="button-login"
          >
            Entrar na Plataforma
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Rankings Dinâmicos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Leaderboards em tempo real que atualizam automaticamente com cada nova venda
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Campanhas Personalizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Crie campanhas com prêmios customizáveis, emojis únicos e imagens motivacionais
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Tv className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Modo TV</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Exiba rankings em telas grandes com celebrações e confetes para motivar a equipe
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Gestão de Equipe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Convites por email, onboarding completo e controle de acesso baseado em papéis
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Analytics Avançados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Dashboards intuitivos com métricas de performance e relatórios detalhados
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>White-Label</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Personalize com sua marca: logo, cores e identidade visual da sua empresa
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para transformar suas vendas em um jogo?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Junte-se às empresas que já usam gamificação para aumentar resultados
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              variant="secondary" 
              size="lg"
              className="text-lg px-8 py-6"
              data-testid="button-login-cta"
            >
              Começar Agora
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
