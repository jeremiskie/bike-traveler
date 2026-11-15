
export type Lane = "left" | "right";

export type GamePhase = "playing" | "gameOver" | "results";

export interface Obstacle {
  id: number;
  lane: Lane;
  progress: number;
}

export interface GameFrame {
  offset: number;
  obstacles: Obstacle[];
}
