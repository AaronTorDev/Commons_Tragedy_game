import React, { useState } from 'react';
import { LedgerEntry } from '../types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { History, Search } from 'lucide-react';

interface PublicLedgerProps {
  entries: LedgerEntry[];
  currentCandies: number;
}

export const PublicLedger: React.FC<PublicLedgerProps> = ({ entries, currentCandies }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntries = entries.filter((e) =>
    e.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.ticketNumber.toString().includes(searchTerm)
  );

  const totalExtracted = entries.reduce((acc, curr) => acc + curr.receivedLnX, 0);

  return (
    <Card className="shadow-none border-border">
      <CardHeader className="p-4 sm:p-5 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-foreground" />
              <h3 className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
                Pizarra Pública en Tiempo Real
              </h3>
              <Badge variant="secondary" className="font-mono text-xs">
                {entries.length} {entries.length === 1 ? 'jugada' : 'jugadas'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Registro auditable de extracciones y confites asignados.
            </p>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Buscar jugador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>
      </CardHeader>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 bg-muted/30 px-4 py-2 border-b border-border text-xs">
        <div>
          <span className="text-[11px] text-muted-foreground block">Total Extraído:</span>
          <span className="font-semibold font-mono text-foreground">{totalExtracted} confites</span>
        </div>
        <div>
          <span className="text-[11px] text-muted-foreground block">Promedio Extraído:</span>
          <span className="font-semibold font-mono text-foreground">
            {entries.length > 0 ? (totalExtracted / entries.length).toFixed(1) : '0.0'} confites
          </span>
        </div>
        <div className="hidden sm:block">
          <span className="text-[11px] text-muted-foreground block">Bote Restante:</span>
          <span className="font-semibold font-mono text-foreground">{currentCandies} disponibles</span>
        </div>
      </div>

      <CardContent className="p-0">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs">
            {entries.length === 0
              ? 'Aún ningún jugador ha tomado su turno.'
              : 'No se encontraron participantes que coincidan con la búsqueda.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <TableHead className="w-16">Ticket</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead className="text-right">Pedía (x)</TableHead>
                <TableHead className="text-right">Recibió ln(x)</TableHead>
                <TableHead className="text-right">Quedó en Bote</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Hora</TableHead>
              </TableRow>
            </TableHeader>
            <tbody className="divide-y divide-border">
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id} className="text-xs">
                  <TableCell className="font-mono font-medium text-foreground">
                    #{entry.ticketNumber}
                  </TableCell>
                  <TableCell className="font-medium text-foreground max-w-[140px] truncate">
                    {entry.playerName}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground tabular-nums">
                    {entry.chosenX}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-foreground tabular-nums">
                    +{entry.receivedLnX}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground tabular-nums">
                    {entry.remainingCandies}
                  </TableCell>
                  <TableCell className="text-right text-[11px] text-muted-foreground font-mono hidden sm:table-cell">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
