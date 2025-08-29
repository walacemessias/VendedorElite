import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CelebrationPopup } from "./CelebrationPopup";

const saleSchema = z.object({
  sellerId: z.string().min(1, "Vendedor é obrigatório"),
  amount: z.string().min(1, "Valor é obrigatório").transform((val) => parseFloat(val)),
  customerName: z.string().min(1, "Nome do cliente é obrigatório"),
  productDescription: z.string().min(1, "Descrição do produto é obrigatória"),
  notes: z.string().optional(),
});

interface SaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  isSubtraction?: boolean;
}

export function SaleModal({ open, onOpenChange, campaignId, isSubtraction = false }: SaleModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCelebration, setShowCelebration] = useState(false);

  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      sellerId: user?.role === 'seller' ? user.id : '',
      amount: '',
      customerName: '',
      productDescription: '',
      notes: '',
    },
  });

  // Get campaign participants for seller selection
  const { data: participants = [] } = useQuery({
    queryKey: ["/api/campaigns", campaignId, "participants"],
    enabled: !!campaignId && user?.role === 'admin',
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

  const createSaleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof saleSchema>) => {
      const response = await apiRequest('POST', '/api/sales', {
        ...data,
        campaignId,
      });
      return response.json();
    },
    onSuccess: (sale) => {
      // Show celebration
      setShowCelebration(true);
      
      // Reset form
      form.reset();
      
      // Close modal after celebration
      setTimeout(() => {
        onOpenChange(false);
        setShowCelebration(false);
      }, 3000);

      // Invalidate related queries
      queryClient.invalidateQueries(["/api/campaigns", campaignId, "leaderboard"]);
      queryClient.invalidateQueries(["/api/campaigns", campaignId, "sales"]);
      
      toast({
        title: "🎉 Venda registrada!",
        description: `Venda de R$ ${sale.amount} registrada com sucesso`,
      });
    },
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
      toast({
        title: "Erro",
        description: "Falha ao registrar venda. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof saleSchema>) => {
    createSaleMutation.mutate(data);
  };

  if (!campaignId) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" data-testid="dialog-sale-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isSubtraction ? '❌' : '💰'} {isSubtraction ? 'Subtrair Venda' : 'Lançar Nova Venda'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {user?.role === 'admin' && (
                <FormField
                  control={form.control}
                  name="sellerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendedor</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        data-testid="select-seller"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o vendedor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {participants.map((participant: any) => (
                            <SelectItem 
                              key={participant.id} 
                              value={participant.id}
                              data-testid={`option-seller-${participant.id}`}
                            >
                              {participant.firstName} {participant.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Venda</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-muted-foreground">R$</span>
                        <Input 
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          className="pl-10"
                          data-testid="input-amount"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Nome do cliente"
                        data-testid="input-customer"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto/Serviço</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Descrição do produto"
                        data-testid="input-product"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        placeholder="Detalhes adicionais (opcional)"
                        className="h-20 resize-none"
                        data-testid="textarea-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createSaleMutation.isPending}
                  className="flex-1"
                  data-testid="button-submit-sale"
                >
                  {createSaleMutation.isPending ? 'Registrando...' : '🎉 Registrar Venda'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <CelebrationPopup 
        open={showCelebration} 
        onOpenChange={setShowCelebration}
        data-testid="celebration-popup"
      />
    </>
  );
}
