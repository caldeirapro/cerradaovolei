export interface Player {
  id: string;
  name: string;
  registeredAt: string;
}

export interface MatchDetails {
  title: string;
  date: string;
  time: string;
  location: string;
  maxPlayers: number;
  isManuallyEdited?: boolean;
  rawDateStr?: string; // YYYY-MM-DD format for comparing if the date passed
}

export interface Team {
  name: string;
  players: Player[];
}
