
export interface Animal {
  id: string;
  name: string;
  emoji: string;
  color: string;
  soundPrompt: string;
}

export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  FEEDBACK = 'FEEDBACK',
  GAME_OVER = 'GAME_OVER'
}
