import { useAuth } from "@/hooks/useAuth";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { 
  Users, 
  Trophy, 
  BarChart3, 
  Settings, 
  Tv, 
  DollarSign,
  LogOut,
  Menu
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Campanhas", href: "/campaigns", icon: Trophy },
    { name: "Vendedores", href: "/sellers", icon: Users },
    { name: "Relatórios", href: "/reports", icon: BarChart3 },
    { name: "Modo TV", href: "/tv", icon: Tv },
    { name: "Configurações", href: "/settings", icon: Settings },
  ];

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Logo Section */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <DollarSign className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold">VendedorElite</h1>
          <p className="text-sm text-muted-foreground">Sua Empresa Ltda</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => mobile && setMobileMenuOpen(false)}
            >
              <div
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImageUrl} />
            <AvatarFallback>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                {user?.role === 'admin' ? 'Administrador' : 'Vendedor'}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.location.href = '/api/logout'}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden w-64 border-r bg-card lg:flex">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <Sidebar mobile />
              </SheetContent>
            </Sheet>

            <h2 className="text-xl font-semibold">Dashboard de Vendas</h2>
          </div>

          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
