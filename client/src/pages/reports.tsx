import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  DollarSign,
  Users,
  Target,
  Award,
  AlertCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const salesData = [
  { month: 'Jan', vendas: 45000, meta: 50000 },
  { month: 'Fev', vendas: 52000, meta: 50000 },
  { month: 'Mar', vendas: 48000, meta: 55000 },
  { month: 'Abr', vendas: 61000, meta: 55000 },
  { month: 'Mai', vendas: 59000, meta: 60000 },
  { month: 'Jun', vendas: 68000, meta: 65000 },
];

const performanceData = [
  { name: 'João Silva', vendas: 145000, cor: '#10b981' },
  { name: 'Maria Santos', vendas: 132000, cor: '#3b82f6' },
  { name: 'Pedro Costa', vendas: 118000, cor: '#f59e0b' },
  { name: 'Ana Lima', vendas: 95000, cor: '#8b5cf6' },
  { name: 'Carlos Oliveira', vendas: 87000, cor: '#ef4444' },
];

const categoriesData = [
  { name: 'Eletrônicos', value: 35, color: '#10b981' },
  { name: 'Moda', value: 25, color: '#3b82f6' },
  { name: 'Casa', value: 20, color: '#f59e0b' },
  { name: 'Esporte', value: 12, color: '#8b5cf6' },
  { name: 'Outros', value: 8, color: '#6b7280' },
];

export default function Reports() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [period, setPeriod] = useState("month");
  const [reportType, setReportType] = useState("sales");

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

  const exportReport = () => {
    toast({
      title: "🚧 Em desenvolvimento",
      description: "Funcionalidade de exportação será implementada em breve.",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Você precisa estar logado para acessar esta página.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Development Notice */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Relatórios em Desenvolvimento
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Esta seção está sendo implementada com dados reais da sua empresa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Relatórios</h1>
            <p className="text-muted-foreground">Análise detalhada de desempenho e vendas</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full sm:w-40" data-testid="select-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Último Mês</SelectItem>
                <SelectItem value="quarter">Último Trimestre</SelectItem>
                <SelectItem value="year">Último Ano</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={exportReport} className="w-full sm:w-auto" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 485.200</div>
              <p className="text-xs text-green-600">↗ +12.5% vs período anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 1.250</div>
              <p className="text-xs text-blue-600">↗ +5.2% vs período anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversão</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32.8%</div>
              <p className="text-xs text-purple-600">↗ +2.1% vs período anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Vendedor</CardTitle>
              <Award className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">João Silva</div>
              <p className="text-xs text-amber-600">R$ 145.000 em vendas</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="vendas" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="desempenho">Desempenho</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
          </TabsList>

          <TabsContent value="vendas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendas vs Meta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="vendas" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Vendas"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="meta" 
                        stroke="#6b7280" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Meta"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="desempenho" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip 
                        formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                      />
                      <Bar dataKey="vendas" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categorias" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoriesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoriesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}