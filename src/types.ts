export type BoteStatus = 'waiting' | 'active' | 'ended';

export interface Bote {
  id: string;
  code: string;
  name: string;
  initialCapacity: number;
  currentCandies: number;
  status: BoteStatus;
  currentTurnTicket: number;
  totalPlayers: number;
  finalBonus?: number;
  adminPin?: string;
  createdAt: string;
  endedAt?: string | null;
}

export interface Player {
  id: string;
  ticketNumber: number;
  name: string;
  hasPlayed: boolean;
  chosenX?: number | null;
  receivedLnX?: number | null;
  initialClaimed: boolean;
  initialClaimedAt?: string | null;
  bonusClaimed: boolean;
  bonusClaimedAt?: string | null;
  joinedAt: string;
  playedAt?: string | null;
}

export interface LedgerEntry {
  id: string;
  ticketNumber: number;
  playerName: string;
  chosenX: number;
  receivedLnX: number;
  remainingCandies: number;
  timestamp: string;
}
