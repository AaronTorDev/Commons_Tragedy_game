/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  query,
  where,
  onSnapshot,
  updateDoc,
  runTransaction,
  orderBy
} from 'firebase/firestore';
import { Bote, Player, LedgerEntry } from './types';
import { Navbar } from './components/Navbar';
import { BoteHeaderBanner } from './components/BoteHeaderBanner';
import { TicketCard } from './components/TicketCard';
import { DecisionModal } from './components/DecisionModal';
import { PublicLedger } from './components/PublicLedger';
import { JoinBoteView } from './components/JoinBoteView';
import { AdminPanel } from './components/AdminPanel';
import { AdminAuthModal } from './components/AdminAuthModal';
import { GameTheoryGuideModal } from './components/GameTheoryGuideModal';
import { calculateRemainingBonus } from './utils/math';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Scale } from 'lucide-react';

export default function App() {
  // Navigation & role state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('tdc_is_admin') === 'true' || localStorage.getItem('ucr_is_admin') === 'true';
  });
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isTheoryGuideOpen, setIsTheoryGuideOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  // Active Bote & Data
  const [currentBoteId, setCurrentBoteId] = useState<string | null>(() => {
    return localStorage.getItem('tdc_current_bote_id') || localStorage.getItem('ucr_current_bote_id');
  });
  const [bote, setBote] = useState<Bote | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [allBotes, setAllBotes] = useState<Bote[]>([]);

  // Current Student / Player session
  const [myPlayerId, setMyPlayerId] = useState<string | null>(() => {
    return localStorage.getItem('tdc_my_player_id') || localStorage.getItem('ucr_my_player_id');
  });
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);

  // Loading & error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parse URL query parameter ?code=...
  const [urlCode, setUrlCode] = useState<string>('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      setUrlCode(codeParam.toUpperCase());
    }
  }, []);

  // Sync Botes list for Admin
  useEffect(() => {
    const botesRef = collection(db, 'botes');
    const unsub = onSnapshot(
      botesRef,
      (snapshot) => {
        const list: Bote[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as Bote);
        });
        setAllBotes(list);

        if (list.length === 0 && !localStorage.getItem('tdc_has_seeded')) {
          localStorage.setItem('tdc_has_seeded', 'true');
          // Auto-inicializar bote por defecto
          const defaultBoteId = 'bote_comun1';
          const defaultBote: Partial<Bote> = {
            id: defaultBoteId,
            code: 'BOTE100',
            name: 'Teoría de Juegos - Caja de Confites',
            initialCapacity: 100,
            currentCandies: 100,
            status: 'active',
            currentTurnTicket: 1,
            totalPlayers: 0,
            adminPin: '333888',
            createdAt: new Date().toISOString(),
            endedAt: null,
          };
          setDoc(doc(db, 'botes', defaultBoteId), defaultBote).catch(console.error);
        } else if (!currentBoteId) {
          if (urlCode) {
            const found = list.find((b) => b.code.toUpperCase() === urlCode);
            if (found) {
              setCurrentBoteId(found.id);
              localStorage.setItem('tdc_current_bote_id', found.id);
            }
          } else {
            setCurrentBoteId(list[0].id);
            localStorage.setItem('tdc_current_bote_id', list[0].id);
          }
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'botes');
      }
    );

    return () => unsub();
  }, [currentBoteId, urlCode]);

  // Real-time listener for the Active Bote document
  useEffect(() => {
    if (!currentBoteId) {
      setBote(null);
      return;
    }

    const docRef = doc(db, 'botes', currentBoteId);
    const unsub = onSnapshot(
      docRef,
      (d) => {
        if (d.exists()) {
          setBote({ id: d.id, ...d.data() } as Bote);
        } else {
          setBote(null);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `botes/${currentBoteId}`);
      }
    );

    return () => unsub();
  }, [currentBoteId]);

  // Real-time listener for Players subcollection
  useEffect(() => {
    if (!currentBoteId) {
      setPlayers([]);
      return;
    }

    const playersRef = collection(db, 'botes', currentBoteId, 'players');
    const q = query(playersRef, orderBy('ticketNumber', 'asc'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Player[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as Player);
        });
        setPlayers(list);

        // Sync current player
        if (myPlayerId) {
          const found = list.find((p) => p.id === myPlayerId);
          setMyPlayer(found || null);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, `botes/${currentBoteId}/players`);
      }
    );

    return () => unsub();
  }, [currentBoteId, myPlayerId]);

  // Real-time listener for Ledger subcollection
  useEffect(() => {
    if (!currentBoteId) {
      setLedger([]);
      return;
    }

    const ledgerRef = collection(db, 'botes', currentBoteId, 'ledger');
    const q = query(ledgerRef, orderBy('timestamp', 'desc'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: LedgerEntry[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as LedgerEntry);
        });
        setLedger(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, `botes/${currentBoteId}/ledger`);
      }
    );

    return () => unsub();
  }, [currentBoteId]);

  // Join a Bote as Student
  const handleJoinBote = async (code: string, playerName: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // Find bote by code
      const q = query(collection(db, 'botes'), where('code', '==', code.toUpperCase()));
      const snap = await getDocs(q);

      if (snap.empty) {
        setErrorMessage(`No se encontró ningún bote con el código "${code}". Verifica el código con el organizador.`);
        setIsLoading(false);
        return;
      }

      const foundBoteDoc = snap.docs[0];
      const targetBoteId = foundBoteDoc.id;

      // Add player atomically using transaction
      let assignedTicket = 1;
      const newPlayerId = 'p_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      await runTransaction(db, async (transaction) => {
        const bDoc = await transaction.get(doc(db, 'botes', targetBoteId));
        if (!bDoc.exists()) throw new Error('El bote no existe');

        const bData = bDoc.data() as Bote;
        assignedTicket = (bData.totalPlayers || 0) + 1;

        // Update bote totalPlayers
        transaction.update(doc(db, 'botes', targetBoteId), {
          totalPlayers: assignedTicket,
        });

        // Create player document
        const playerRef = doc(db, 'botes', targetBoteId, 'players', newPlayerId);
        transaction.set(playerRef, {
          id: newPlayerId,
          ticketNumber: assignedTicket,
          name: playerName,
          hasPlayed: false,
          chosenX: null,
          receivedLnX: null,
          initialClaimed: false,
          initialClaimedAt: null,
          bonusClaimed: false,
          bonusClaimedAt: null,
          joinedAt: new Date().toISOString(),
          playedAt: null,
        });
      });

      // Save local state
      setCurrentBoteId(targetBoteId);
      setMyPlayerId(newPlayerId);
      localStorage.setItem('tdc_current_bote_id', targetBoteId);
      localStorage.setItem('tdc_my_player_id', newPlayerId);
    } catch (err) {
      console.error(err);
      setErrorMessage('Error al unirse al bote. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit decision in turn
  const handleSubmitDecision = async (chosenX: number, receivedLnX: number) => {
    if (!currentBoteId || !myPlayer || !bote) return;

    try {
      await runTransaction(db, async (transaction) => {
        const bDoc = await transaction.get(doc(db, 'botes', currentBoteId));
        if (!bDoc.exists()) throw new Error('El bote no existe');

        const bData = bDoc.data() as Bote;
        const remaining = Math.max(0, bData.currentCandies - receivedLnX);
        const nextTicket = bData.currentTurnTicket + 1;

        // Update bote candies and auto advance turn
        transaction.update(doc(db, 'botes', currentBoteId), {
          currentCandies: remaining,
          currentTurnTicket: nextTicket,
        });

        // Update player record
        const pRef = doc(db, 'botes', currentBoteId, 'players', myPlayer.id);
        transaction.update(pRef, {
          hasPlayed: true,
          chosenX,
          receivedLnX,
          playedAt: new Date().toISOString(),
        });

        // Add to public ledger
        const ledgerId = 'l_' + Date.now();
        const lRef = doc(db, 'botes', currentBoteId, 'ledger', ledgerId);
        transaction.set(lRef, {
          id: ledgerId,
          ticketNumber: myPlayer.ticketNumber,
          playerName: myPlayer.name,
          chosenX,
          receivedLnX,
          remainingCandies: remaining,
          timestamp: new Date().toISOString(),
        });
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `botes/${currentBoteId}`);
    }
  };

  // Admin: Create Bote
  const handleCreateBote = async (
    name: string,
    code: string,
    initialCapacity: number,
    adminPin: string
  ) => {
    const boteId = 'bote_' + code.toLowerCase();
    const newBoteData: Partial<Bote> = {
      id: boteId,
      code,
      name,
      initialCapacity,
      currentCandies: initialCapacity,
      status: 'waiting',
      currentTurnTicket: 1,
      totalPlayers: 0,
      adminPin: adminPin || '333888',
      createdAt: new Date().toISOString(),
      endedAt: null,
    };

    try {
      await setDoc(doc(db, 'botes', boteId), newBoteData);
      setCurrentBoteId(boteId);
      localStorage.setItem('tdc_current_bote_id', boteId);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `botes/${boteId}`);
    }
  };

  // Admin: Delete Bote
  const handleDeleteBote = async (boteIdToDelete: string) => {
    try {
      // 1. Delete players subcollection
      const playersSnap = await getDocs(collection(db, 'botes', boteIdToDelete, 'players'));
      const batch = writeBatch(db);
      playersSnap.forEach((d) => batch.delete(d.ref));

      // 2. Delete ledger subcollection
      const ledgerSnap = await getDocs(collection(db, 'botes', boteIdToDelete, 'ledger'));
      ledgerSnap.forEach((d) => batch.delete(d.ref));

      // 3. Delete root bote doc
      batch.delete(doc(db, 'botes', boteIdToDelete));

      await batch.commit();

      // Switch active bote if current was deleted
      if (currentBoteId === boteIdToDelete) {
        const remaining = allBotes.filter((b) => b.id !== boteIdToDelete);
        if (remaining.length > 0) {
          setCurrentBoteId(remaining[0].id);
          localStorage.setItem('tdc_current_bote_id', remaining[0].id);
        } else {
          setCurrentBoteId(null);
          localStorage.removeItem('tdc_current_bote_id');
        }
        setMyPlayer(null);
        setMyPlayerId(null);
        localStorage.removeItem('tdc_my_player_id');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `botes/${boteIdToDelete}`);
    }
  };

  // Admin: Next Turn
  const handleNextTurn = async () => {
    if (!currentBoteId || !bote) return;
    try {
      await updateDoc(doc(db, 'botes', currentBoteId), {
        currentTurnTicket: bote.currentTurnTicket + 1,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `botes/${currentBoteId}`);
    }
  };

  // Admin: Prev Turn
  const handlePrevTurn = async () => {
    if (!currentBoteId || !bote || bote.currentTurnTicket <= 1) return;
    try {
      await updateDoc(doc(db, 'botes', currentBoteId), {
        currentTurnTicket: bote.currentTurnTicket - 1,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `botes/${currentBoteId}`);
    }
  };

  // Admin: Toggle Status
  const handleToggleStatus = async (newStatus: 'waiting' | 'active' | 'ended') => {
    if (!currentBoteId) return;
    try {
      await updateDoc(doc(db, 'botes', currentBoteId), {
        status: newStatus,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `botes/${currentBoteId}`);
    }
  };

  // Admin: Finalize Game
  const handleFinalizeGame = async () => {
    if (!currentBoteId || !bote) return;
    try {
      const finalBonus = calculateRemainingBonus(bote.currentCandies);
      await updateDoc(doc(db, 'botes', currentBoteId), {
        status: 'ended',
        finalBonus,
        endedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `botes/${currentBoteId}`);
    }
  };

  // Admin: Toggle Initial Claim (physical candy dispatch)
  const handleToggleInitialClaim = async (playerId: string, currentVal: boolean) => {
    if (!currentBoteId) return;
    try {
      await updateDoc(doc(db, 'botes', currentBoteId, 'players', playerId), {
        initialClaimed: !currentVal,
        initialClaimedAt: !currentVal ? new Date().toISOString() : null,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `botes/${currentBoteId}/players/${playerId}`);
    }
  };

  // Admin: Toggle Bonus Claim (physical final dividend dispatch)
  const handleToggleBonusClaim = async (playerId: string, currentVal: boolean) => {
    if (!currentBoteId) return;
    try {
      await updateDoc(doc(db, 'botes', currentBoteId, 'players', playerId), {
        bonusClaimed: !currentVal,
        bonusClaimedAt: !currentVal ? new Date().toISOString() : null,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `botes/${currentBoteId}/players/${playerId}`);
    }
  };

  // Admin Auth verification
  const handleAdminAuth = (pin: string) => {
    const validPin = bote?.adminPin || '333888';
    if (pin === validPin || pin === '333888') {
      setIsAdmin(true);
      localStorage.setItem('tdc_is_admin', 'true');
      return true;
    }
    return false;
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('tdc_is_admin');
    localStorage.removeItem('ucr_is_admin');
  };

  const handleResetSession = () => {
    setMyPlayerId(null);
    setMyPlayer(null);
    localStorage.removeItem('tdc_my_player_id');
    localStorage.removeItem('ucr_my_player_id');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar
        isAdmin={isAdmin}
        onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
        onOpenTheoryGuide={() => setIsTheoryGuideOpen(true)}
        onResetToHome={handleResetSession}
        boteCode={bote?.code}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Admin Panel */}
        {isAdmin ? (
          <AdminPanel
            bote={bote}
            players={players}
            allBotes={allBotes}
            onSelectBote={(id) => {
              setCurrentBoteId(id);
              localStorage.setItem('tdc_current_bote_id', id);
            }}
            onCreateBote={handleCreateBote}
            onDeleteBote={handleDeleteBote}
            onNextTurn={handleNextTurn}
            onPrevTurn={handlePrevTurn}
            onToggleStatus={handleToggleStatus}
            onFinalizeGame={handleFinalizeGame}
            onToggleInitialClaim={handleToggleInitialClaim}
            onToggleBonusClaim={handleToggleBonusClaim}
          />
        ) : null}

        {/* Join View */}
        {!isAdmin && !myPlayer && (
          <JoinBoteView
            initialCode={urlCode || bote?.code || ''}
            onJoin={handleJoinBote}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        )}

        {/* Active Player Ticket View */}
        {!isAdmin && myPlayer && bote && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <BoteHeaderBanner bote={bote} />

              <TicketCard
                player={myPlayer}
                bote={bote}
                onOpenDecision={() => setIsDecisionModalOpen(true)}
              />

              <PublicLedger entries={ledger} currentCandies={bote.currentCandies} />
            </div>

            {/* Turn Queue & Economic Insight */}
            <div className="space-y-4">
              <Card className="border-border shadow-none">
                <CardHeader className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-foreground" />
                      <CardTitle className="text-xs font-semibold uppercase tracking-wider">
                        Cola de Turnos ({players.length})
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      Turno: #{bote.currentTurnTicket}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-2 space-y-1 max-h-72 overflow-y-auto">
                  {players.map((p) => {
                    const isDeciding = bote.currentTurnTicket === p.ticketNumber && !p.hasPlayed;
                    const isMe = p.id === myPlayer.id;

                    return (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-md text-xs flex items-center justify-between transition-colors ${
                          isDeciding
                            ? 'bg-muted font-semibold text-foreground border border-border'
                            : p.hasPlayed
                            ? 'text-muted-foreground'
                            : 'text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-xs font-semibold text-muted-foreground shrink-0">
                            #{p.ticketNumber}
                          </span>
                          <span className="truncate">
                            {p.name} {isMe ? '(Tú)' : ''}
                          </span>
                        </div>

                        <div className="text-[11px] shrink-0 font-normal">
                          {isDeciding && (
                            <Badge variant="default" className="text-[10px] h-4 px-1.5">
                              Decidiendo
                            </Badge>
                          )}
                          {p.hasPlayed && (
                            <span className="text-muted-foreground font-mono">+{p.receivedLnX}</span>
                          )}
                          {!isDeciding && !p.hasPlayed && (
                            <span className="text-muted-foreground text-[10px]">En espera</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Economic Insight Card */}
              <Card className="border-border shadow-none bg-muted/40">
                <CardContent className="p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Dilema de Elección</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    Extraer mucho otorga una recompensa inmediata marginalmente decreciente, pero reduce el dividendo final colectivo para todos los participantes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Ledger in Admin View */}
        {isAdmin && bote && (
          <div className="pt-2">
            <PublicLedger entries={ledger} currentCandies={bote.currentCandies} />
          </div>
        )}
      </main>

      {/* Decision Modal */}
      {myPlayer && bote && (
        <DecisionModal
          isOpen={isDecisionModalOpen}
          onClose={() => setIsDecisionModalOpen(false)}
          currentCandies={bote.currentCandies}
          playerName={myPlayer.name}
          ticketNumber={myPlayer.ticketNumber}
          onSubmitDecision={handleSubmitDecision}
        />
      )}

      {/* Admin Auth Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onAuthenticate={handleAdminAuth}
      />

      {/* Game Theory Guide Modal */}
      <GameTheoryGuideModal
        isOpen={isTheoryGuideOpen}
        onClose={() => setIsTheoryGuideOpen(false)}
      />

      {/* Footer */}

      <footer className="mt-auto border-t border-border py-4 text-center text-xs text-muted-foreground bg-background">
        <p>
          <strong>Tragedia de los Comunes</strong>
        </p>

        <p className="flex items-center justify-center gap-1.5 mt-1">
          <i className="fa-brands fa-github"></i>
          <a
            href="https://github.com/AaronTorDev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-foreground transition-colors"
          >
            github.com/AaronTorDev
          </a>
        </p>
      </footer>
    </div>
  );
}
