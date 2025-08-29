import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
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

export default function Campaigns() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);

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

  const form = useForm<z.infer<typeof campaignSchema>>({
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

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"],
    enabled: isAuthenticated,
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
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: z.infer<typeof campaignSchema>) => {
      const response = await apiRequest('POST', '/api/campaigns', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/campaigns"]);
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
        title: "Erro",
        description: "Falha ao criar campanha. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof campaignSchema> }) => {
      const response = await apiRequest('PUT', `/api/campaigns/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/campaigns"]);
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
        title: "Erro",
        description: "Falha ao atualizar campanha. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof campaignSchema>) => {
    if (editingCampaign) {
      updateCampaignMutation.mutate({ id: editingCampaign.id, data });
    } else {
      createCampaignMutation.mutate(data);
    }
  };

  const handleEdit = (campaign: any) => {
    setEditingCampaign(campaign);
    form.reset({
      name: campaign.name,
      description: campaign.description || '',
      prizeEmoji: campaign.prizeEmoji || '🏆',
      prizeDescription: campaign.prizeDescription || '',
      startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
      endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
      targetAmount: campaign.targetAmount?.toString() || '',
    });
    setCreateModalOpen(true);
  };

  const handlePrizeImageUpload = async () => {
    const response = await apiRequest('POST', '/api/objects/upload');
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL,
    };
  };

  const handlePrizeImageComplete = async (result: any) => {
    if (result.successful && result.successful[0]) {
      const uploadURL = result.successful[0].uploadURL;
      
      try {
        await apiRequest('PUT', '/api/prize-images', {
          prizeImageUrl: uploadURL,
        });
        
        toast({
          title: "✅ Imagem do prêmio salva!",
          description: "A imagem foi enviada com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao salvar imagem do prêmio.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando campanhas...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Campanhas</h1>
            <p className="text-muted-foreground">
              Gerencie campanhas de vendas e premiações
            </p>
          </div>
          
          {user?.role === 'admin' && (
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-campaign">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl" data-testid="dialog-campaign-form">
                <DialogHeader>
                  <DialogTitle>
                    {editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}
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
                            <FormLabel>Nome da Campanha</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: Q1 2024 - iPhone 15 Pro" data-testid="input-campaign-name" />
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
                              <Input {...field} placeholder="🏆" data-testid="input-prize-emoji" />
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
                              {...field} 
                              placeholder="Descrição da campanha..."
                              className="h-20 resize-none"
                              data-testid="textarea-campaign-description"
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
                            <Input {...field} placeholder="Ex: iPhone 15 Pro 256GB" data-testid="input-prize-description" />
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
                            <FormLabel>Data de Início</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-start-date" />
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
                            <FormLabel>Data de Fim</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-end-date" />
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
                                {...field} 
                                type="number" 
                                step="0.01"
                                placeholder="100000.00"
                                data-testid="input-target-amount"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Prize Image Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Imagem do Prêmio</label>
                      <ObjectUploader
                        onGetUploadParameters={handlePrizeImageUpload}
                        onComplete={handlePrizeImageComplete}
                        buttonClassName="w-full"
                      >
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          Enviar Imagem do Prêmio
                        </div>
                      </ObjectUploader>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setCreateModalOpen(false);
                          setEditingCampaign(null);
                          form.reset();
                        }}
                        className="flex-1"
                        data-testid="button-cancel-campaign"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
                        className="flex-1"
                        data-testid="button-save-campaign"
                      >
                        {editingCampaign ? 'Atualizar' : 'Criar'} Campanha
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Campaigns Grid */}
        {campaignsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma campanha encontrada</h3>
              <p className="text-muted-foreground mb-6">
                {user?.role === 'admin' 
                  ? 'Crie sua primeira campanha para começar a gamificar as vendas'
                  : 'Você ainda não foi adicionado a nenhuma campanha'
                }
              </p>
              {user?.role === 'admin' && (
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Campanha
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign: any) => {
              const isActive = new Date() >= new Date(campaign.startDate) && new Date() <= new Date(campaign.endDate);
              const isUpcoming = new Date() < new Date(campaign.startDate);
              const isExpired = new Date() > new Date(campaign.endDate);

              return (
                <Card key={campaign.id} className="group hover:shadow-lg transition-all duration-300" data-testid={`card-campaign-${campaign.id}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{campaign.prizeEmoji || '🏆'}</span>
                        <div>
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          {campaign.prizeDescription && (
                            <p className="text-sm text-muted-foreground">
                              {campaign.prizeDescription}
                            </p>
                          )}
                        </div>
                      </div>
                      {user?.role === 'admin' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(campaign)}
                          data-testid={`button-edit-campaign-${campaign.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <Badge 
                      variant={isActive ? 'default' : isUpcoming ? 'secondary' : 'outline'}
                      className="w-fit"
                    >
                      {isActive ? 'Ativa' : isUpcoming ? 'Em breve' : 'Finalizada'}
                    </Badge>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {campaign.description && (
                      <p className="text-sm text-muted-foreground">
                        {campaign.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(campaign.startDate), 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                          {format(new Date(campaign.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                      
                      {campaign.targetAmount && (
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>Meta: R$ {campaign.targetAmount.toLocaleString('pt-BR')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
