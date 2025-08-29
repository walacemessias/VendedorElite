import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { CampaignSelector } from "./CampaignSelector";
import { useAuth } from "@/hooks/useAuth";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Tv, 
  Bell, 
  LogOut, 
  User, 
  Settings,
  Menu 
} from "lucide-react";

interface HeaderProps {
  campaigns?: any[];
  selectedCampaignId?: string;
  onCampaignChange?: (campaignId: string) => void;
  onSaleModalOpen?: () => void;
  onTVModeOpen?: () => void;
  onMobileMenuToggle?: () => void;
}

export default function Header({
  campaigns = [],
  selectedCampaignId = "",
  onCampaignChange,
  onSaleModalOpen,
  onTVModeOpen,
  onMobileMenuToggle
}: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMobileMenuToggle}
            data-testid="button-mobile-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <h2 className="text-xl font-semibold hidden md:block">Dashboard de Vendas</h2>
          
          {/* Campaign Selector */}
          {campaigns.length > 0 && onCampaignChange && (
            <CampaignSelector
              campaigns={campaigns}
              selectedCampaignId={selectedCampaignId}
              onCampaignChange={onCampaignChange}
            />
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <ModeToggle />

          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-2">
            {onSaleModalOpen && (
              <Button 
                onClick={onSaleModalOpen}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-launch-sale"
              >
                <Plus className="mr-2 h-4 w-4" />
                Lançar Venda
              </Button>
            )}
            
            {onTVModeOpen && (
              <Button
                variant="outline"
                onClick={onTVModeOpen}
                data-testid="button-tv-mode"
              >
                <Tv className="mr-2 h-4 w-4" />
                Modo TV
              </Button>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0" data-testid="button-user-menu">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <Badge 
                  variant={user?.role === 'admin' ? 'default' : 'secondary'} 
                  className="mt-2 text-xs"
                >
                  {user?.role === 'admin' ? 'Administrador' : 'Vendedor'}
                </Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem data-testid="menu-profile">
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="menu-settings">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => window.location.href = '/api/logout'}
                data-testid="menu-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
