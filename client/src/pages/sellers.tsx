import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Mail, Trophy, Target, TrendingUp, Search } from "lucide-react";

const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(1, "Nome é obrigatório"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export default function Sellers() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

  const { data: sellers = [], isLoading: sellersLoading } = useQuery<User[]>({
    queryKey: ["/api/sellers"],
    enabled: isAuthenticated,
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: InviteFormData) => {
      const response = await apiRequest('POST', '/api/sellers/invite', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sellers"] });
      setInviteModalOpen(false);
      form.reset();
      toast({
        title: "✅ Convite enviado!",
        description: "Email de convite enviado com sucesso.",
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
        description: "Erro ao enviar convite. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InviteFormData) => {
    inviteMutation.mutate(data);
  };

  const filteredSellers = sellers.filter(seller => 
    seller.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Vendedores</h1>
            <p className="text-muted-foreground">Gerencie sua equipe de vendas</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar vendedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
                data-testid="input-search-seller"
              />
            </div>
            
            {(user as User)?.role === 'admin' && (
              <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto" data-testid="button-invite-seller">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Convidar Vendedor
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Convidar Novo Vendedor</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo *</FormLabel>
                            <FormControl>
                              <Input placeholder="João Silva" {...field} data-testid="input-invite-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="vendedor@empresa.com" 
                                {...field} 
                                data-testid="input-invite-email" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setInviteModalOpen(false)}
                          data-testid="button-cancel"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={inviteMutation.isPending}
                          data-testid="button-send-invite"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          {inviteMutation.isPending ? "Enviando..." : "Enviar Convite"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {sellersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredSellers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "Nenhum vendedor encontrado" : "Nenhum vendedor cadastrado"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Tente buscar com outros termos."
                  : (user as User)?.role === 'admin' 
                    ? "Convide vendedores para começar a montar sua equipe!"
                    : "Aguarde seu administrador adicionar vendedores."
                }
              </p>
              {!searchTerm && (user as User)?.role === 'admin' && (
                <Button onClick={() => setInviteModalOpen(true)} data-testid="button-invite-first">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convidar Primeiro Vendedor
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSellers.map((seller) => (
              <Card key={seller.id} className="hover:shadow-lg transition-shadow" data-testid={`card-seller-${seller.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={seller.profileImageUrl || ''} />
                        <AvatarFallback>
                          {(seller.firstName?.[0] || '') + (seller.lastName?.[0] || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {seller.firstName} {seller.lastName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{seller.email}</p>
                      </div>
                    </div>
                    <Badge variant={seller.role === 'admin' ? 'default' : 'secondary'}>
                      {seller.role === 'admin' ? 'Admin' : 'Vendedor'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Trophy className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-xs text-muted-foreground">Posição</p>
                    </div>
                    <div>
                      <Target className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-xs text-muted-foreground">Vendas</p>
                    </div>
                    <div>
                      <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-500" />
                      <p className="text-2xl font-bold">0%</p>
                      <p className="text-xs text-muted-foreground">Meta</p>
                    </div>
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