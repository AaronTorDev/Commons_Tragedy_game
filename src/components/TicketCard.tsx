import React from 'react';
import { Player, Bote } from '../types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Ticket, CheckCircle2, Clock, ArrowRight, AlertTriangle } from 'lucide-react';

interface TicketCardProps {
  player: Player;
  bote: Bote;
  onOpenDecision: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ player, bote, onOpenDecision }) => {
  const isMyTurn = !player.hasPlayed && bote.status === 'active' && bote.currentTurnTicket === player.ticketNumber;
  const isWaitingTurn = !player.hasPlayed && bote.currentTurnTicket < player.ticketNumber;
  const isPassedTurn = !player.hasPlayed && bote.currentTurnTicket > player.ticketNumber;

  const projectedBonus = Math.max(0, Math.round(Math.log(Math.max(bote.currentCandies, 1))));

  return (
    <Card className="border-border shadow-none overflow-hidden">
      {/* Ticket Header */}
      <CardHeader className="bg-muted/50 p-4 sm:p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-foreground text-background flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Ticket de Participante
              </div>
              <div className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                {player.name}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-medium text-muted-foreground">Número</div>
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
              #{player.ticketNumber}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* State Banners */}
        {isMyTurn && (
          <div className="p-4 bg-muted border border-border rounded-lg flex flex-col gap-3">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <span className="w-2 h-2 rounded-full bg-foreground" />
              <span>Es tu turno de decidir</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Hay {bote.currentCandies} confites disponibles en el bote común. Elige la cantidad que deseas extraer; tu pago será el logaritmo natural redondeado: round(ln(x)).
            </p>
            <Button
              onClick={onOpenDecision}
              className="w-full text-xs font-semibold gap-2"
            >
              <span>Tomar mi Decisión</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {isWaitingTurn && (
          <div className="p-3 bg-muted/40 border border-border rounded-lg flex items-center gap-2.5 text-xs text-muted-foreground">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <span className="font-medium text-foreground">En espera de turno. </span>
              Turno actual: Ticket #{bote.currentTurnTicket}. Faltan {player.ticketNumber - bote.currentTurnTicket} turnos para el tuyo.
            </div>
          </div>
        )}

        {isPassedTurn && (
          <div className="p-3 bg-muted/40 border border-border rounded-lg flex items-center gap-2.5 text-xs text-muted-foreground">
            <AlertTriangle className="w-4 h-4 shrink-0 text-foreground" />
            <div>
              Tu turno ha pasado (actualmente va por #{bote.currentTurnTicket}). Solicita al administrador retroceder el turno si no pudiste votar.
            </div>
          </div>
        )}

        {/* Section 1: Extraction Candies Result */}
        <div className="border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground uppercase tracking-wide text-[11px]">
              1. Extracción de tu Turno
            </span>
            {player.hasPlayed ? (
              <Badge variant="outline" className="text-[11px] font-normal">
                Registrado
              </Badge>
            ) : (
              <span className="text-[11px] text-muted-foreground italic">Pendiente</span>
            )}
          </div>

          {player.hasPlayed ? (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">Cantidad solicitada (x):</span>
                  <div className="text-sm font-semibold font-mono text-foreground">
                    {player.chosenX} confites
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Asignado round(ln(x)):</span>
                  <div className="text-xl font-bold font-mono text-foreground">
                    {player.receivedLnX} {player.receivedLnX === 1 ? 'confite' : 'confites'}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Physical Claim Status for Initial Extraction */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Entrega en caja física:</span>
                {player.initialClaimed ? (
                  <Badge variant="secondary" className="gap-1 font-normal text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />
                    Entregado en caja
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 font-normal text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    Pendiente de retirar
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-1">
              Podrás escoger la cantidad de confites cuando el administrador llame al Ticket #{player.ticketNumber}.
            </p>
          )}
        </div>

        {/* Section 2: Commons Final Bonus Projection */}
        <div className="border border-border rounded-lg p-4 space-y-2 bg-muted/20">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground uppercase tracking-wide text-[11px]">
              2. Dividendo Colectivo por Bote Restante
            </span>
            {bote.status === 'ended' && (
              <Badge variant="secondary" className="text-[10px]">
                Juego Finalizado
              </Badge>
            )}
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-xs text-muted-foreground">
                {bote.status === 'ended' ? 'Bono repartido:' : 'Bono con el bote actual:'}
              </span>
              <div className="text-lg font-bold font-mono text-foreground">
                +{bote.status === 'ended' ? bote.finalBonus : projectedBonus} confites extra
              </div>
            </div>
            <div className="text-right text-[11px] text-muted-foreground font-mono">
              round(ln({bote.currentCandies}))
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {bote.status === 'ended'
              ? 'El juego ha finalizado. Todos los participantes registrados reciben este bono del recurso común preservado.'
              : 'Este valor es dinámico y varía según las extracciones que hagan los siguientes compañeros en su turno.'}
          </p>

          {bote.status === 'ended' && (
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Entrega de Bono Final:</span>
              {player.bonusClaimed ? (
                <Badge variant="secondary" className="gap-1 font-normal text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Bono Entregado
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 font-normal text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  Pendiente de entrega
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Total Summary */}
        <div className="p-3 bg-muted rounded-lg border border-border flex items-center justify-between">
          <div className="text-xs">
            <span className="text-muted-foreground block text-[10px] uppercase font-medium">Total Acumulado</span>
            <span className="font-medium text-foreground">Tus confites del experimento</span>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold font-mono text-foreground">
              {(player.receivedLnX ?? 0) + (bote.status === 'ended' ? (bote.finalBonus ?? 0) : projectedBonus)}
            </span>
            <span className="text-xs text-muted-foreground ml-1">confites</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
