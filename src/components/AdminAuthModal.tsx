import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, AlertCircle } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (pin: string) => boolean;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticate,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onAuthenticate(pin.trim());
    if (success) {
      setPin('');
      setError(false);
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xs p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-foreground" />
            <DialogTitle className="text-base font-semibold">Acceso de Administrador</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Ingresa el PIN para gestionar turnos y registrar el despacho en la caja.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-2.5 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>PIN incorrecto.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground">
              PIN de Acceso
            </label>
            <Input
              type="password"
              placeholder="••••••"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
              required
              className="text-xs h-9 tracking-widest font-mono"
            />
          </div>

          <Button type="submit" className="w-full text-xs h-9">
            Entrar al Panel
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
