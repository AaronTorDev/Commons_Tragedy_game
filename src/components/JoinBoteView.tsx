import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Box, ArrowRight, AlertCircle } from 'lucide-react';

interface JoinBoteViewProps {
  initialCode?: string;
  onJoin: (code: string, playerName: string) => Promise<void>;
  isLoading: boolean;
  errorMessage?: string | null;
}

export const JoinBoteView: React.FC<JoinBoteViewProps> = ({
  initialCode = '',
  onJoin,
  isLoading,
  errorMessage,
}) => {
  const [code, setCode] = useState(initialCode);
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !playerName.trim() || isLoading) return;
    onJoin(code.trim().toUpperCase(), playerName.trim());
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mb-3">
          <Box className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          La Tragedia de los Comunes
        </h1>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Simulación interactiva de teoría de juegos y dilemas de recursos de uso común.
        </p>
      </div>

      <Card className="border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Unirse al Bote</CardTitle>
          <CardDescription className="text-xs">
            Ingresa el código que está en la caja de confites y tu nombre para recibir tu ticket.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label htmlFor="bote-code" className="block text-xs font-medium text-foreground">
                Código del Bote
              </label>
              <Input
                id="bote-code"
                type="text"
                placeholder="Ej. BOTE100"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                className="font-mono font-semibold uppercase text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="player-name" className="block text-xs font-medium text-foreground">
                Tu Nombre y Apellido
              </label>
              <Input
                id="player-name"
                type="text"
                placeholder="Ej. Carlos Mora"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
                maxLength={60}
                className="text-xs h-9"
              />
              <p className="text-[11px] text-muted-foreground">
                Se te asignará un ticket correlativo según el orden de llegada.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !code.trim() || !playerName.trim()}
              className="w-full text-xs font-semibold gap-1.5 h-9 mt-1"
            >
              {isLoading ? (
                'Conectando al bote...'
              ) : (
                <>
                  <span>Obtener mi Ticket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </form>

          {/* Clean Rules Snapshot */}
          <div className="pt-3 border-t border-border space-y-1.5 text-xs text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Extracción: </span>
              Si solicitas x confites, recibes round(ln(x)) confites físicos.
            </div>
            <div>
              <span className="font-medium text-foreground">Dividendo final: </span>
              El remanente en el bote se reparte entre todos: round(ln(remanente)).
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
