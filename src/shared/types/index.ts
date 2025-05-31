export interface Symbol {
  id: number;
  url: string;
}

export interface ReelState {
  symbols: Symbol[];
  position: number;
  isSpinning: boolean;
}

export interface SpinResult {
  value: number;
  timestamp: number;
} 