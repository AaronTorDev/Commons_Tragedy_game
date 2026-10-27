import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
              <span>1. El Recurso de Uso Común (CPR)</span>
            </div>
            <p>
              Un bien común es <strong>rival</strong> (lo que extrae un jugador reduce lo disponible para los demás) pero <strong>no excluible</strong> (todos los participantes con ticket tienen acceso al bote).
            </p>
            <p>
              La racionalidad individual pura incentiva a extraer antes de que otros lo hagan, llevando al colapso del recurso y alejando al colectivo del <em>Óptimo de Pareto</em>.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-muted/40 border border-border rounded-lg p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-medium text-foreground text-xs">
              <Award className="w-3.5 h-3.5" />
              <span>2. Función de Pago Logarítmica</span>
            </div>
            <p>
              Para modelar la <em>utilidad marginal decreciente</em> en el consumo y evitar que un solo jugador vacíe el bote de golpe, quien pide $x$ confites recibe:
            </p>
            <div className="p-2 bg-background border border-border rounded text-center font-mono font-semibold text-foreground text-sm">
              f(x) = round(ln(x))
            </div>
            <p className="text-[11px]">
              Ejemplo: Pedir 1 confite da $\ln(1)=0$; pedir 3 da $\approx 1$; pedir 20 da $\approx 3$; pedir 100 da $\approx 5$. Pedir un número enorme tiene rendimientos decrecientes drásticos.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-muted/40 border border-border rounded-lg p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-medium text-foreground text-xs">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>3. El Dividendo Colectivo (Gobernanza de Comunes)</span>
            </div>
            <p>
              Como demostró Elinor Ostrom, la cooperación y la transparencia permiten sostener el recurso. En este experimento, <strong>lo que queda en el bote al terminar</strong> se reparte entre todos:
            </p>
            <div className="p-2 bg-background border border-border rounded text-center font-mono font-semibold text-foreground">
              Bono_Final = round(ln(Bote_Restante))
            </div>
            <p className="text-[11px]">
              Si los participantes coordinan extracciones moderadas, el bote restante genera un dividendo colectivo sustancial para cada uno.
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
