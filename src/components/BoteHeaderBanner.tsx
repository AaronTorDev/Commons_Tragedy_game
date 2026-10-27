import React from 'react';
import { Bote } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Box, AlertCircle } from 'lucide-react';

interface BoteHeaderBannerProps {
  bote: Bote;
}

export const BoteHeaderBanner: React.FC<BoteHeaderBannerProps> = ({ bote }) => {
  const percentage = Math.max(0, Math.min(100, (bote.currentCandies / bote.initialCapacity) * 100));

  return (
    <Card className="shadow-none border-border">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                {bote.name}
              </h2>
              {bote.status === 'ended' && (
                <Badge variant="secondary" className="text-xs">
                  Finalizado
                </Badge>
              )}
              {bote.status === 'active' && (
                <Badge variant="outline" className="text-xs border-foreground/30 text-foreground">
                  En Curso
                </Badge>
              )}
              {bote.status === 'waiting' && (
                <Badge variant="secondary" className="text-xs">
                  En Espera
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Código: <span className="font-mono font-medium text-foreground">{bote.code}</span> · {bote.totalPlayers} jugadores registrados
            </p>
          </div>

          {/* Current Turn Badge */}
          <div className="flex items-center gap-2.5 bg-muted/60 border border-border px-3 py-1.5 rounded-lg self-start sm:self-auto">
            <span className="text-[11px] font-mono font-semibold bg-background border px-1.5 py-0.5 rounded text-foreground">
              #{bote.currentTurnTicket}
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium leading-none">
                Turno Actual
              </span>
              <span className="text-xs font-medium text-foreground">
                {bote.status === 'ended' ? 'Juego concluido' : `Ticket #${bote.currentTurnTicket}`}
              </span>
            </div>
          </div>
        </div>

        {/* Candies in Bote Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-border">
          <div className="bg-muted/40 rounded-lg p-3 border border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-normal">
              <Box className="w-3.5 h-3.5" />
              <span>Confites en el Bote</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-semibold font-mono tabular-nums text-foreground">
                {bote.currentCandies}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                / {bote.initialCapacity}
              </span>
            </div>
          </div>

          <div className="bg-muted/40 rounded-lg p-3 border border-border">
            <div className="text-xs text-muted-foreground font-normal">
              Bono Final Proyectado
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-semibold font-mono tabular-nums text-foreground">
                +{bote.status === 'ended' ? (bote.finalBonus ?? 0) : Math.max(0, Math.round(Math.log(Math.max(bote.currentCandies, 1))))}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {bote.status === 'ended' ? 'confites c/u' : 'confites c/u'}
              </span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-muted/40 rounded-lg p-3 border border-border flex flex-col justify-center">
            <div className="flex justify-between items-center text-xs text-muted-foreground mb-1.5">
              <span>Nivel del Recurso Común</span>
              <span className="font-mono text-foreground font-medium">{percentage.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/50">
              <div
                className="h-full bg-foreground transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {bote.currentCandies === 0 && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span><strong>Tragedia consumada:</strong> El recurso común se ha agotado por completo. Ya no quedan confites en el bote para los próximos turnos ni para el dividendo final.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
