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
}

export interface Team {
  name: string;
  players: Player[];
}
