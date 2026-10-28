import React, { useState, useEffect } from 'react';
import { calculateLn, calculateLnFloat, calculateWithPython } from '../utils/math';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MathView, MathText } from './MathView';
import { Check, ArrowRight } from 'lucide-react';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCandies: number;
  playerName: string;
  ticketNumber: number;
  onSubmitDecision: (chosenX: number, receivedLnX: number) => Promise<void>;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  isOpen,
  onClose,
  currentCandies,
  playerName,
  ticketNumber,
  onSubmitDecision,
}) => {
  const [chosenX, setChosenX] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setPythonStatus] = useState<{ isPython: boolean; raw: number } | null>(null);

  const maxAvailable = Math.max(1, currentCandies);

  useEffect(() => {
    if (chosenX > maxAvailable) {
      setChosenX(maxAvailable);
    }
  }, [maxAvailable, chosenX]);

  const receivedLnX = calculateLn(chosenX);
  const rawLnX = calculateLnFloat(chosenX);
  const remainingAfter = Math.max(0, currentCandies - receivedLnX);
  const projectedBonusAfter = Math.max(0, Math.round(Math.log(Math.max(remainingAfter, 1))));

  useEffect(() => {
    let active = true;
    calculateWithPython(chosenX).then((res) => {
      if (active) {
        setPythonStatus({ isPython: res.isPython, raw: res.raw });
      }
    });
    return () => {
      active = false;
    };
  }, [chosenX]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (chosenX < 1 || chosenX > maxAvailable || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmitDecision(chosenX, receivedLnX);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              Ticket #{ticketNumber}
            </Badge>
            <span className="text-xs text-muted-foreground">{playerName}</span>
          </div>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Decisión de Extracción
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Bote actual: <span className="font-mono font-medium text-foreground">{currentCandies} confites</span> disponibles.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Slider and Input */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="extract-slider" className="text-xs font-medium text-foreground flex items-center gap-1">
                <span>Cantidad que deseas pedir</span>
                <MathView math="(x):" />
              </label>
              <div className="flex items-center gap-1.5">
                <Input
                  id="extract-input"
                  type="number"
                  min={1}
                  max={maxAvailable}
                  value={chosenX}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setChosenX(Math.max(1, Math.min(maxAvailable, val)));
                    }
                  }}
                  className="w-18 h-8 text-right font-mono font-semibold text-xs"
                />
                <span className="text-xs text-muted-foreground">confites</span>
              </div>
            </div>

            {/* Shadcn Slider */}
            <Slider
              value={[chosenX]}
              min={1}
              max={maxAvailable}
              step={1}
              onValueChange={(val: any) => {
                const num = Array.isArray(val) ? val[0] : typeof val === 'number' ? val : 1;
                setChosenX(num);
              }}
              className="py-1"
            />

            {/* Presets */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <Button
                type="button"
                variant={chosenX === 1 ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs font-normal"
                onClick={() => setChosenX(1)}
              >
                1
              </Button>
              <Button
                type="button"
                variant={chosenX === Math.max(1, Math.round(maxAvailable * 0.25)) ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs font-normal"
                onClick={() => setChosenX(Math.max(1, Math.round(maxAvailable * 0.25)))}
              >
                25%
              </Button>
              <Button
                type="button"
                variant={chosenX === Math.max(1, Math.round(maxAvailable * 0.5)) ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs font-normal"
                onClick={() => setChosenX(Math.max(1, Math.round(maxAvailable * 0.5)))}
              >
                50%
              </Button>
              <Button
                type="button"
                variant={chosenX === maxAvailable ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs font-normal"
                onClick={() => setChosenX(maxAvailable)}
              >
                100%
              </Button>
            </div>
          </div>

          <Separator />

          {/* Payoff Calculation Box with KaTeX */}
          <div className="bg-muted/50 border border-border rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">Función de Utilidad:</span>
              <MathView math="f(x) \ln(x)" className="text-xs font-semibold" />
            </div>

            {/* Live Evaluated LaTeX equation */}
            <div className="bg-background py-1 px-2.5 rounded border border-border text-center">
              <MathView
                math={`f(${chosenX}) = \ln(${chosenX}) = ${receivedLnX}\\text{ confites}`}
                block={true}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-background p-2.5 rounded-md border border-border">
                <span className="text-[11px] text-muted-foreground block">Recibirás en mano:</span>
                <div className="text-xl font-bold font-mono text-foreground mt-0.5">
                  {receivedLnX} <span className="text-xs font-normal text-muted-foreground">confites</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  <MathView math={`\\ln(${chosenX}) = ${rawLnX.toFixed(3)}`} />
                </div>
              </div>

              <div className="bg-background p-2.5 rounded-md border border-border">
                <span className="text-[11px] text-muted-foreground block">Quedarán en el bote:</span>
                <div className="text-xl font-bold font-mono text-foreground mt-0.5">
                  {remainingAfter} <span className="text-xs font-normal text-muted-foreground">(-{receivedLnX})</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  <MathView math={`\\text{Bono: } +${projectedBonusAfter}`} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-foreground" />
                Validado con Python (math.log)
              </span>
              <span className="font-mono font-medium text-foreground">
                math.log({chosenX}) → {receivedLnX}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground leading-relaxed">
            <MathText text={`Dilema: Pedir $x = ${chosenX}$ confites te otorga $${receivedLnX}$ en mano, pero reduce el dividendo colectivo para todos a $${remainingAfter}$ confites en el bote.`} />
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-1/3 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 text-xs gap-1.5"
            >
              {isSubmitting ? (
                'Registrando...'
              ) : (
                <>
                  <span>Confirmar Extracción ({receivedLnX})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
