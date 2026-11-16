
export type Lane = "left" | "right";

export type GamePhase = "playing" | "gameOver" | "results";

export interface CharacterConfig {
  lane: Lane;
  sizeRatio: number;
  verticalPosition: number;
}

export interface RoadConfig {
  horizonRatio: number;
  topWidthRatio: number;
  bottomWidthRatio: number;
}

export type ObstacleModel = "spikes" | "rocks" | "logs";

export interface Obstacle {
  id: number;
  lane: Lane;
  progress: number;
  model: ObstacleModel;
}

export interface GameFrame {
  offset: number;
  obstacles: Obstacle[];
}
