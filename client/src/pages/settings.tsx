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
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ObjectUploader } from "@/components/ObjectUploader";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useTheme } from "@/components/ThemeProvider";
import { 
  Settings as SettingsIcon, 
  Palette, 
  Upload, 
  DollarSign, 
  Building2,
  Moon,
  Sun,
  Shield
} from "lucide-react";

const companySchema = z.object({
  name: z.string().min(1, "Nome da empresa é obrigatório"),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

export default function Settings() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

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

  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      primaryColor: '#10b981',
      secondaryColor: '#f59e0b',
    },
  });

  const { data: company } = useQuery({
    queryKey: ["/api/companies", user?.companyId],
    enabled: isAuthenticated && !!user?.companyId,
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

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name || '',
        primaryColor: company.primaryColor || '#10b981',
        secondaryColor: company.secondaryColor || '#f59e0b',
      });
    }
  }, [company, form]);

  const updateCompanyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof companySchema>) => {
      if (!user?.companyId) {
        throw new Error("Company ID not found");
      }
      const response = await apiRequest('PUT', `/api/companies/${user.companyId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/companies", user?.companyId]);
      toast({
        title: "✅ Configurações salvas!",
        description: "As configurações da empresa foram atualizadas.",
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
        description: "Falha ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof companySchema>) => {
    updateCompanyMutation.mutate(data);
  };

  const handleLogoUpload = async () => {
    const response = await apiRequest('POST', '/api/objects/upload');
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL,
    };
  };

  const handleLogoComplete = async (result: any) => {
    if (result.successful && result.successful[0]) {
      const uploadURL = result.successful[0].uploadURL;
      
      try {
        await apiRequest('PUT', '/api/company-logo', {
          logoUrl: uploadURL,
        });
        
        queryClient.invalidateQueries(["/api/companies", user?.companyId]);
        
        toast({
          title: "✅ Logo atualizada!",
          description: "A logo da empresa foi atualizada com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao salvar logo da empresa.",
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
          <p className="mt-4 text-muted-foreground">Carregando configurações...</p>
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
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">
              Personalize a plataforma com a identidade da sua empresa
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Branding */}
            {user?.role === 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Identidade da Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Logo da Empresa</label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                          {company?.logoUrl ? (
                            <img src={company.logoUrl} alt="Company Logo" className="w-14 h-14 object-contain rounded-lg" />
                          ) : (
                            <DollarSign className="h-8 w-8 text-primary-foreground" />
                          )}
                        </div>
                        <ObjectUploader
                          onGetUploadParameters={handleLogoUpload}
                          onComplete={handleLogoComplete}
                          maxNumberOfFiles={1}
                          maxFileSize={5242880} // 5MB
                        >
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            {company?.logoUrl ? 'Trocar Logo' : 'Enviar Logo'}
                          </div>
                        </ObjectUploader>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Formatos aceitos: PNG, JPG, SVG. Tamanho máximo: 5MB
                      </p>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Empresa</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Ex: Sua Empresa Ltda"
                                  data-testid="input-company-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="primaryColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cor Primária</FormLabel>
                                <FormControl>
                                  <div className="flex items-center gap-3">
                                    <Input 
                                      {...field} 
                                      type="color"
                                      className="w-16 h-10 p-1 rounded-md"
                                      data-testid="input-primary-color"
                                    />
                                    <Input 
                                      {...field} 
                                      placeholder="#10b981"
                                      className="flex-1"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="secondaryColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cor Secundária</FormLabel>
                                <FormControl>
                                  <div className="flex items-center gap-3">
                                    <Input 
                                      {...field} 
                                      type="color"
                                      className="w-16 h-10 p-1 rounded-md"
                                      data-testid="input-secondary-color"
                                    />
                                    <Input 
                                      {...field} 
                                      placeholder="#f59e0b"
                                      className="flex-1"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button 
                          type="submit" 
                          disabled={updateCompanyMutation.isPending}
                          data-testid="button-save-company"
                        >
                          <Building2 className="mr-2 h-4 w-4" />
                          {updateCompanyMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                      </form>
                    </Form>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Aparência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Tema da Interface</p>
                    <p className="text-sm text-muted-foreground">
                      Escolha entre modo claro e escuro
                    </p>
                  </div>
                  <ModeToggle />
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="font-medium">Preview do Tema</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-background">
                      <div className="space-y-2">
                        <div className="h-2 bg-primary rounded w-3/4" />
                        <div className="h-2 bg-muted rounded w-1/2" />
                        <div className="h-8 bg-card border rounded flex items-center px-3">
                          <div className="h-2 bg-muted-foreground rounded w-16" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary rounded-full" />
                          <div className="h-2 bg-foreground rounded w-20" />
                        </div>
                        <div className="h-2 bg-muted-foreground rounded w-3/4" />
                        <div className="h-6 bg-primary rounded w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Informações do Usuário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Nome</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Função</p>
                  <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                    {user?.role === 'admin' ? 'Administrador' : 'Vendedor'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/api/logout'}
                  data-testid="button-logout"
                >
                  Sair da Conta
                </Button>
              </CardContent>
            </Card>

            {/* Platform Info */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre a Plataforma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">VendedorElite</p>
                    <p className="text-xs text-muted-foreground">v1.0.0</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Plataforma de gamificação de vendas que transforma sua equipe em campeões.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
