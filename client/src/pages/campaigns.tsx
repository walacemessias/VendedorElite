import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import type { Campaign, User } from "@shared/schema";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Plus, Trophy, Calendar, Users, Target, Image, Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const campaignSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  prizeEmoji: z.string().default("🏆"),
  prizeDescription: z.string().optional(),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().min(1, "Data de fim é obrigatória"),
  targetAmount: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

export default function Campaigns() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

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

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      description: '',
      prizeEmoji: '🏆',
      prizeDescription: '',
      startDate: '',
      endDate: '',
      targetAmount: '',
    },
  });

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
    enabled: isAuthenticated,
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const response = await apiRequest('POST', '/api/campaigns', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setCreateModalOpen(false);
      setEditingCampaign(null);
      form.reset();
      toast({
        title: "✅ Campanha criada!",
        description: "Nova campanha foi criada com sucesso.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Acesso Negado",
          description: "Sessão expirada. Redirecionando...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "❌ Erro",
        description: "Erro ao criar campanha. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CampaignFormData }) => {
      const response = await apiRequest('PUT', `/api/campaigns/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setCreateModalOpen(false);
      setEditingCampaign(null);
      form.reset();
      toast({
        title: "✅ Campanha atualizada!",
        description: "Campanha foi atualizada com sucesso.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Acesso Negado",
          description: "Sessão expirada. Redirecionando...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "❌ Erro",
        description: "Erro ao atualizar campanha. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    if (editingCampaign) {
      updateCampaignMutation.mutate({ id: editingCampaign.id, data });
    } else {
      createCampaignMutation.mutate(data);
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    form.reset({
      name: campaign.name,
      description: campaign.description || '',
      prizeEmoji: campaign.prizeEmoji || '🏆',
      prizeDescription: campaign.prizeDescription || '',
      startDate: format(new Date(campaign.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(campaign.endDate), 'yyyy-MM-dd'),
      targetAmount: campaign.targetAmount?.toString() || '',
    });
    setCreateModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingCampaign(null);
    form.reset();
    setCreateModalOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Campanhas de Vendas</h1>
            <p className="text-muted-foreground">Gerencie suas campanhas e acompanhe o progresso da equipe</p>
          </div>
          
          {(user as User)?.role === 'admin' && (
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreateNew} data-testid="button-create-campaign">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCampaign ? 'Editar Campanha' : 'Criar Nova Campanha'}
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Campanha *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Mega Promoção Janeiro" {...field} data-testid="input-campaign-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="prizeEmoji"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emoji do Prêmio</FormLabel>
                            <FormControl>
                              <Input placeholder="🏆" {...field} data-testid="input-prize-emoji" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva os objetivos e regras da campanha"
                              className="resize-none"
                              {...field}
                              data-testid="input-campaign-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prizeDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição do Prêmio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Ex: iPhone 15 Pro Max + Viagem para Cancún"
                              className="resize-none"
                              {...field}
                              data-testid="input-prize-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Início *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-start-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Fim *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-end-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="targetAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta (R$)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder="50000.00"
                                {...field}
                                data-testid="input-target-amount"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCreateModalOpen(false)}
                        data-testid="button-cancel"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
                        data-testid="button-save-campaign"
                      >
                        {(createCampaignMutation.isPending || updateCampaignMutation.isPending) ? "Salvando..." : 
                         editingCampaign ? "Atualizar" : "Criar Campanha"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {campaignsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma campanha encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {(user as User)?.role === 'admin' 
                  ? "Crie sua primeira campanha para começar a gamificar as vendas da sua equipe!"
                  : "Aguarde seu administrador criar campanhas para você participar."
                }
              </p>
              {(user as User)?.role === 'admin' && (
                <Button onClick={handleCreateNew} data-testid="button-create-first-campaign">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Campanha
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="group hover:shadow-lg transition-shadow duration-200" data-testid={`card-campaign-${campaign.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{campaign.prizeEmoji || '🏆'}</div>
                      <div>
                        <CardTitle className="text-lg leading-tight">{campaign.name}</CardTitle>
                        <Badge variant={campaign.isActive ? "default" : "secondary"} className="mt-1">
                          {campaign.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                    </div>
                    {(user as User)?.role === 'admin' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(campaign)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-edit-campaign-${campaign.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {campaign.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {campaign.description}
                    </p>
                  )}
                  
                  {campaign.prizeDescription && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        🎁 {campaign.prizeDescription}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Período
                      </span>
                      <span className="font-medium">
                        {format(new Date(campaign.startDate), 'dd/MM', { locale: ptBR })} - {format(new Date(campaign.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                    
                    {campaign.targetAmount && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Meta
                        </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          R$ {Number(campaign.targetAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}