import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Trophy, Users, BarChart3, Tv, Target, Crown, Medal } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function Landing() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">VendedorElite</h1>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Button onClick={() => window.location.href = '/api/login'} data-testid="button-login-header">
              Entrar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="h-12 w-12 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                VendedorElite
              </h1>
              <p className="text-lg text-muted-foreground">Plataforma de Gamificação de Vendas</p>
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Transforme sua equipe de vendas em campeões com rankings em tempo real, 
            premiações customizáveis e celebrações envolventes que motivam resultados extraordinários.
          </p>
          
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg" 
            className="text-lg px-10 py-6 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
            data-testid="button-login-hero"
          >
            <Crown className="mr-3 h-5 w-5" />
            Começar Agora
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Rankings Dinâmicos</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                Leaderboards em tempo real que atualizam automaticamente com cada nova venda, 
                mantendo a competição sempre aquecida
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Campanhas Personalizadas</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                Crie campanhas com prêmios customizáveis, emojis únicos e imagens motivacionais 
                que engajam sua equipe
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Tv className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Modo TV</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                Exiba rankings em telas grandes com celebrações e confetes para motivar 
                toda a equipe em tempo real
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Gestão de Equipe</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                Convites por email, onboarding completo e controle de acesso baseado em papéis 
                para administradores e vendedores
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Analytics Avançados</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                Dashboards intuitivos com métricas de performance e relatórios detalhados 
                para tomada de decisões estratégicas
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">White-Label</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                Personalize completamente com sua marca: logo, cores e identidade visual 
                da sua empresa integrada
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-12 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Resultados Comprovados</h2>
            <p className="text-muted-foreground text-lg">Empresas que usam gamificação veem melhorias significativas</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">+34%</div>
              <p className="text-muted-foreground">Aumento em Vendas</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">+45%</div>
              <p className="text-muted-foreground">Engajamento da Equipe</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">+28%</div>
              <p className="text-muted-foreground">Retenção de Funcionários</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-0 shadow-2xl">
          <CardContent className="text-center py-16">
            <Medal className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-4xl font-bold mb-6">
              Pronto para conquistar o topo?
            </h2>
            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
              Junte-se às empresas que já transformaram suas vendas em um jogo competitivo e lucrativo
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              variant="secondary" 
              size="lg"
              className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid="button-login-cta"
            >
              <Trophy className="mr-3 h-5 w-5" />
              Entrar na Competição
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 VendedorElite. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
