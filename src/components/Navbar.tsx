import React from 'react';
import { BookOpen, Shield, LogOut, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavbarProps {
  isAdmin: boolean;
  onOpenAdminAuth: () => void;
  onLogoutAdmin: () => void;
  onOpenTheoryGuide: () => void;
  onResetToHome?: () => void;
  boteCode?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdmin,
  onOpenAdminAuth,
  onLogoutAdmin,
  onOpenTheoryGuide,
  onResetToHome,
  boteCode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <button
          onClick={onResetToHome}
          className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md p-1 -ml-1"
        >
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <Box className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-foreground leading-none">
              Tragedia de los Comunes
            </span>
            <span className="text-[11px] text-muted-foreground font-normal mt-0.5">
              Teoría de Juegos · Economía Experimental
            </span>
          </div>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {boteCode && (
            <Badge variant="outline" className="hidden sm:inline-flex font-mono text-xs font-semibold px-2 py-0.5">
              <span className="text-[10px] text-muted-foreground mr-1 uppercase">Bote:</span>
              {boteCode}
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenTheoryGuide}
            className="text-xs h-8 px-2.5 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reglas & Modelo</span>
          </Button>

          {isAdmin ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={onLogoutAdmin}
              className="text-xs h-8 px-3 gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Admin</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAdminAuth}
              className="text-xs h-8 px-3 gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
