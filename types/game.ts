
export interface GameDimensions {
  width: number;
  height: number;
}

export interface RoadConfig {
  horizonRatio: number;
  topWidthRatio: number;
  bottomWidthRatio: number;
  speed: number;
}

export interface CharacterConfig {
  lane: "left" | "right";
  sizeRatio: number;
  verticalPosition: number;
}
