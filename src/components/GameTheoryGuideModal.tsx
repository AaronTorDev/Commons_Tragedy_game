import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MathView, MathText } from './MathView';
import { BookOpen, Scale, Award, HelpCircle } from 'lucide-react';

interface GameTheoryGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameTheoryGuideModal: React.FC<GameTheoryGuideModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-6 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-foreground" />
            <DialogTitle className="text-base font-semibold">Fundamentos de Teoría de Juegos</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Modelo económico de la Tragedia de los Comunes y función de utilidad logarítmica.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs text-muted-foreground leading-relaxed">
          {/* Section 1 */}
          <div className="bg-muted/40 border border-border rounded-lg p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-medium text-foreground text-xs">
              <Scale className="w-3.5 h-3.5" />
              <span>1. El Recurso de Uso Común </span>
            </div>
            <p>
              Un bien común es <strong>rival</strong> (lo que extrae un jugador reduce lo disponible para los demás) pero <strong>no excluible</strong> (todos los participantes con ticket tienen acceso al bote).
            </p>
            <p>
              El que los jugadores sean racionales incentiva a extraer antes de que otros lo hagan, llevando al colapso del recurso y alejando al colectivo del <em>Óptimo de Pareto</em>.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-muted/40 border border-border rounded-lg p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-medium text-foreground text-xs">
              <Award className="w-3.5 h-3.5" />
              <span>2. Función de Pago Logarítmica</span>
            </div>
            <p>
              <MathText text="Para modelar la utilidad marginal decreciente en el consumo y amortiguar que un solo agente agote el recurso de golpe, cada jugador que solicita $x$ confites recibe:" />
            </p>
            <div className="p-2.5 bg-background border border-border rounded-md text-center py-2">
              <MathView math="u_i(x_i) = \ln(x_i)" block={true} />
            </div>
            <div className="text-[11px] space-y-1 pt-1">
              <p>Ejemplos de utilidad marginal decreciente:</p>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                <div className="bg-background/80 p-1.5 rounded border border-border/60">
                  <MathView math="\ln(1) = 0 \implies 0\text{ confites}" />
                </div>
                <div className="bg-background/80 p-1.5 rounded border border-border/60">
                  <MathView math="\ln(3) \approx 1.10 \implies 1\text{ confite}" />
                </div>
                <div className="bg-background/80 p-1.5 rounded border border-border/60">
                  <MathView math="\ln(20) \approx 2.99 \implies 3\text{ confites}" />
                </div>
                <div className="bg-background/80 p-1.5 rounded border border-border/60">
                  <MathView math="\ln(100) \approx 4.60 \implies 5\text{ confites}" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground pt-1">
                <MathText text="Extraer $100$ confites solo otorga $5$ confites físicos en mano, pero destruye el dividendo colectivo." />
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-muted/40 border border-border rounded-lg p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-medium text-foreground text-xs">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>3. Del restante ganan todos</span>
            </div>
            <p>
              La cooperación y la transparencia permiten sostener el recurso. En este experimento, <strong>lo que queda en el bote al terminar</strong> le beneficia a todos:
            </p>
            <div className="p-2.5 bg-background border border-border rounded-md text-center py-2">
              <MathView math="\text{Bono Final} = \ln(\text{Bote} \ {\text{Restante}})" block={true} />
            </div>
            <p className="text-[11px]">
              <MathText text="Si el grupo coordina extracciones bajas ($x$), el Bote Restante es alto y cada participante termina con más confites totales." />
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
