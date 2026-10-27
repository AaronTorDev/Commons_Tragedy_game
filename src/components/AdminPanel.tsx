import React, { useState } from 'react';
import { Bote, Player } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  CheckCircle2,
  Clock,
  PlusCircle,
  QrCode,
  Share2,
  Search,
  Box,
  RotateCcw,
  Trash2
} from 'lucide-react';

interface AdminPanelProps {
  bote: Bote | null;
  players: Player[];
  allBotes?: Bote[];
  onSelectBote: (boteId: string) => void;
  onCreateBote: (name: string, code: string, initialCapacity: number, adminPin: string) => Promise<void>;
  onDeleteBote: (boteId: string) => Promise<void>;
  onNextTurn: () => Promise<void>;
  onPrevTurn: () => Promise<void>;
  onToggleStatus: (newStatus: 'waiting' | 'active' | 'ended') => Promise<void>;
  onFinalizeGame: () => Promise<void>;
  onToggleInitialClaim: (playerId: string, currentVal: boolean) => Promise<void>;
  onToggleBonusClaim: (playerId: string, currentVal: boolean) => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  bote,
  players,
  allBotes = [],
  onSelectBote,
  onCreateBote,
  onDeleteBote,
  onNextTurn,
  onPrevTurn,
  onToggleStatus,
  onFinalizeGame,
  onToggleInitialClaim,
  onToggleBonusClaim,
}) => {
  const [activeTab, setActiveTab] = useState('control');
  const [showQrModal, setShowQrModal] = useState(false);
  const [searchClaim, setSearchClaim] = useState('');
  const [filterPendingOnly, setFilterPendingOnly] = useState(false);
  const [boteToDelete, setBoteToDelete] = useState<Bote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create form state
  const [newName, setNewName] = useState('Bote de Confites - Teoría de Juegos');
  const [newCode, setNewCode] = useState(() => 'BOTE' + Math.floor(100 + Math.random() * 900));
  const [newCapacity, setNewCapacity] = useState(100);
  const [newPin, setNewPin] = useState('1234');
  const [isCreating, setIsCreating] = useState(false);

  // Finalize confirmation state
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim() || newCapacity <= 0 || isCreating) return;
    try {
      setIsCreating(true);
      await onCreateBote(newName.trim(), newCode.trim().toUpperCase(), newCapacity, newPin.trim());
      setActiveTab('control');
    } finally {
      setIsCreating(false);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareableJoinUrl = bote ? `${currentUrl}?code=${bote.code}` : '';

  // Filter players for claims
  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchClaim.toLowerCase()) ||
      p.ticketNumber.toString().includes(searchClaim);
    if (!matchesSearch) return false;
    if (filterPendingOnly) {
      const initialPending = p.hasPlayed && !p.initialClaimed;
      const bonusPending = bote?.status === 'ended' && !p.bonusClaimed;
      return initialPending || bonusPending;
    }
    return true;
  });

  const totalInitialUnclaimed = players.filter((p) => p.hasPlayed && !p.initialClaimed).length;
  const totalBonusUnclaimed = bote?.status === 'ended' ? players.filter((p) => !p.bonusClaimed).length : 0;

  return (
    <div className="space-y-4">
      {/* Tabs using Shadcn */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="control" className="text-xs">
            Control de Juego
          </TabsTrigger>
          <TabsTrigger value="claims" className="text-xs">
            Despacho Físico
            {totalInitialUnclaimed + totalBonusUnclaimed > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] h-4">
                {totalInitialUnclaimed + totalBonusUnclaimed}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="create" className="text-xs">
            Nuevo Bote
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CONTROL */}
        <TabsContent value="control" className="pt-3">
          {bote ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 border-border shadow-none">
                <CardHeader className="p-4 sm:p-5 border-b border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                        Panel de Administración (Disfraz)
                      </div>
                      <CardTitle className="text-base sm:text-lg font-semibold mt-0.5">
                        {bote.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Código de sala: <span className="font-mono font-semibold text-foreground">{bote.code}</span>
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowQrModal(true)}
                      className="text-xs h-8 gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Ver QR para Caja</span>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 space-y-4">
                  {/* Turn Manager */}
                  <div className="bg-muted/40 border border-border rounded-lg p-4">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">
                      Gestión de Turnos Secuenciales
                    </span>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md bg-foreground text-background font-mono font-bold text-xl flex items-center justify-center">
                          #{bote.currentTurnTicket}
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Ticket decidiendo ahora:</div>
                          <div className="text-sm font-semibold text-foreground">
                            {players.find((p) => p.ticketNumber === bote.currentTurnTicket)?.name ||
                              'Esperando jugador con este ticket'}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Total de tickets registrados: {players.length}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onPrevTurn}
                          disabled={bote.currentTurnTicket <= 1}
                          className="h-8 px-2.5"
                          title="Retroceder Turno (-1)"
                        >
                          <SkipBack className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          size="sm"
                          onClick={onNextTurn}
                          className="text-xs h-8 gap-1 font-medium"
                          title="Avanzar al siguiente ticket"
                        >
                          <span>Siguiente Turno</span>
                          <SkipForward className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      {bote.status === 'waiting' && (
                        <Button
                          size="sm"
                          onClick={() => onToggleStatus('active')}
                          className="text-xs h-8 gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Iniciar Juego</span>
                        </Button>
                      )}

                      {bote.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onToggleStatus('waiting')}
                          className="text-xs h-8 gap-1.5"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pausar</span>
                        </Button>
                      )}

                      {bote.status === 'ended' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onToggleStatus('active')}
                          className="text-xs h-8 gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reabrir Bote</span>
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {bote.status !== 'ended' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowFinalizeConfirm(true)}
                          className="text-xs h-8"
                        >
                          Finalizar Juego & Dividendo
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBoteToDelete(bote)}
                        className="text-xs h-8 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Borrar Bote</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Side Info & Switch */}
              <div className="space-y-4">
                <Card className="border-border shadow-none text-center">
                  <CardContent className="p-4 sm:p-5">
                    <div className="p-3 bg-white border border-border rounded-lg inline-block mb-3">
                      <QRCodeSVG value={shareableJoinUrl} size={120} />
                    </div>
                    <div className="text-xs font-mono font-semibold text-foreground">
                      CÓDIGO: {bote.code}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 mb-3">
                      Muestra este QR para que tus compañeros se unan desde sus celulares.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(shareableJoinUrl);
                        alert('¡Enlace copiado al portapapeles!');
                      }}
                      className="w-full text-xs h-8 gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Copiar Enlace Directo</span>
                    </Button>
                  </CardContent>
                </Card>

                {allBotes.length > 0 && (
                  <Card className="border-border shadow-none">
                    <CardHeader className="p-3.5 border-b border-border">
                      <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Tus Botes Guardados ({allBotes.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 space-y-1 max-h-48 overflow-y-auto">
                      {allBotes.map((b) => (
                        <div key={b.id} className="flex items-center gap-1 group">
                          <button
                            onClick={() => onSelectBote(b.id)}
                            className={`flex-1 text-left px-2.5 py-1.5 text-xs rounded-md flex items-center justify-between transition-colors ${
                              b.id === bote.id
                                ? 'bg-muted font-medium text-foreground'
                                : 'hover:bg-muted/50 text-muted-foreground'
                            }`}
                          >
                            <span className="truncate">{b.name}</span>
                            <span className="font-mono text-[10px] text-muted-foreground shrink-0 ml-2">{b.code}</span>
                          </button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setBoteToDelete(b)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                            title="Borrar este bote de la base de datos"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card className="p-6 text-center text-xs text-muted-foreground">
              No hay bote seleccionado. Crea uno en la pestaña &quot;Nuevo Bote&quot;.
            </Card>
          )}
        </TabsContent>

        {/* TAB 2: DESPACHO FÍSICO */}
        <TabsContent value="claims" className="pt-3">
          <Card className="border-border shadow-none">
            <CardHeader className="p-4 sm:p-5 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Box className="w-4 h-4" />
                    <span>Despacho Físico en la Caja</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Marca cada entrega física de confites para prevenir reclamos dobles.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <Input
                      type="text"
                      placeholder="Ticket # o nombre..."
                      value={searchClaim}
                      onChange={(e) => setSearchClaim(e.target.value)}
                      className="pl-8 h-8 text-xs w-44"
                    />
                  </div>

                  <Button
                    variant={filterPendingOnly ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterPendingOnly(!filterPendingOnly)}
                    className="text-xs h-8"
                  >
                    Solo Pendientes
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {filteredPlayers.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  No hay jugadores para mostrar con los filtros actuales.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      <TableHead className="w-16">Ticket</TableHead>
                      <TableHead>Estudiante</TableHead>
                      <TableHead className="text-center">Extracción Inicial (ln(x))</TableHead>
                      <TableHead className="text-center">Bono Remanente Final</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlayers.map((p) => (
                      <TableRow key={p.id} className="text-xs">
                        <TableCell className="font-mono font-semibold text-foreground">
                          #{p.ticketNumber}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-foreground block">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {p.hasPlayed ? `Pidió ${p.chosenX} confites` : 'Aún no juega'}
                          </span>
                        </TableCell>

                        {/* Initial Extraction Claim */}
                        <TableCell className="text-center">
                          {p.hasPlayed ? (
                            <Button
                              variant={p.initialClaimed ? 'secondary' : 'default'}
                              size="sm"
                              onClick={() => onToggleInitialClaim(p.id, p.initialClaimed)}
                              className="text-xs h-7 gap-1 font-normal"
                            >
                              {p.initialClaimed ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-foreground" />
                                  <span>Entregado ({p.receivedLnX})</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3" />
                                  <span>Entregar {p.receivedLnX}</span>
                                </>
                              )}
                            </Button>
                          ) : (
                            <span className="text-muted-foreground italic text-[11px]">—</span>
                          )}
                        </TableCell>

                        {/* Final Bonus Claim */}
                        <TableCell className="text-center">
                          {bote?.status === 'ended' ? (
                            <Button
                              variant={p.bonusClaimed ? 'secondary' : 'outline'}
                              size="sm"
                              onClick={() => onToggleBonusClaim(p.id, p.bonusClaimed)}
                              className="text-xs h-7 gap-1 font-normal"
                            >
                              {p.bonusClaimed ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-foreground" />
                                  <span>Bono Entregado (+{bote.finalBonus})</span>
                                </>
                              ) : (
                                <>
                                  <span>Entregar Bono (+{bote.finalBonus})</span>
                                </>
                              )}
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">
                              Al finalizar juego
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: CREAR BOTE */}
        <TabsContent value="create" className="pt-3">
          <Card className="max-w-md mx-auto border-border shadow-none">
            <CardHeader className="p-5 border-b border-border">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                <span>Crear Nueva Sala de Bote</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5">
              <form onSubmit={handleCreate} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-foreground">
                    Nombre de la Sala
                  </label>
                  <Input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-foreground">
                      Código del Bote
                    </label>
                    <Input
                      type="text"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                      required
                      maxLength={12}
                      className="text-xs font-mono font-semibold uppercase h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-foreground">
                      Capacidad de Confites
                    </label>
                    <Input
                      type="number"
                      min={10}
                      max={1000}
                      value={newCapacity}
                      onChange={(e) => setNewCapacity(parseInt(e.target.value, 10) || 50)}
                      required
                      className="text-xs font-mono font-semibold h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-foreground">
                    PIN de Administrador
                  </label>
                  <Input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isCreating}
                  className="w-full text-xs font-semibold h-9 mt-1"
                >
                  {isCreating ? 'Creando Bote...' : 'Crear Bote e Iniciar'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* QR MODAL */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="max-w-xs text-center p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Código QR de la Caja</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Escanea para ingresar al bote directamente.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-white border border-border rounded-lg inline-block mx-auto my-2">
            <QRCodeSVG value={shareableJoinUrl} size={180} />
          </div>

          <div className="bg-muted p-2.5 rounded-md font-mono text-center">
            <div className="text-[10px] uppercase font-medium text-muted-foreground">Código de Sala:</div>
            <div className="text-xl font-bold tracking-widest text-foreground">{bote?.code}</div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FINALIZE CONFIRMATION DIALOG */}
      <Dialog open={showFinalizeConfirm} onOpenChange={setShowFinalizeConfirm}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">¿Finalizar el Juego?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Al finalizar, el juego quedará cerrado. Se calculará el dividendo colectivo para todos los jugadores con base en los <strong className="text-foreground">{bote?.currentCandies} confites restantes</strong>:
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-muted border border-border rounded-lg text-center my-2">
            <span className="text-[11px] text-muted-foreground block">Dividendo final para cada participante:</span>
            <span className="text-xl font-bold font-mono text-foreground">
              +{Math.max(0, Math.round(Math.log(Math.max(bote?.currentCandies || 0, 1))))} confites
            </span>
            <span className="text-[10px] text-muted-foreground block font-mono mt-0.5">
              round(ln({bote?.currentCandies || 0}))
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFinalizeConfirm(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                setShowFinalizeConfirm(false);
                await onFinalizeGame();
              }}
              className="text-xs"
            >
              Confirmar y Finalizar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE BOTE CONFIRMATION DIALOG */}
      <Dialog open={!!boteToDelete} onOpenChange={(open) => !open && setBoteToDelete(null)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-destructive flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>¿Borrar bote de la base de datos?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Estás a punto de borrar permanentemente el bote{' '}
              <strong className="text-foreground">{boteToDelete?.name} ({boteToDelete?.code})</strong>.
              Esta acción eliminará todos los confites, tickets y registros de jugadas de la base de datos en tiempo real.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setBoteToDelete(null)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={async () => {
                if (!boteToDelete) return;
                try {
                  setIsDeleting(true);
                  await onDeleteBote(boteToDelete.id);
                  setBoteToDelete(null);
                } finally {
                  setIsDeleting(false);
                }
              }}
              className="text-xs gap-1.5"
            >
              {isDeleting ? 'Borrando...' : 'Sí, borrar definitivamente'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
