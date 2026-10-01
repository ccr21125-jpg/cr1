import { assetRegistry } from "./assets";

export interface PlatformStat {
  id: string;
  label: string;
  value: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  /** true = valore dimostrativo, da sostituire con dato verificato. */
  isDemo: boolean;
  /** Fonte del dato verificato (obbligatoria quando isDemo = false). */
  source?: string;
}

/** ⚠️ VALORI DIMOSTRATIVI — non sono risultati aziendali. */
export const mockStats: PlatformStat[] = [
  { id: "utenti", label: "Utenti", value: 25000, decimals: 0, suffix: "+", isDemo: true },
  { id: "asset", label: "Asset supportati", value: 120, decimals: 0, isDemo: true },
  { id: "volume", label: "Volume analizzato", value: 1.2, decimals: 1, suffix: "\u00a0Mld\u00a0$", isDemo: true },
  { id: "uptime", label: "Disponibilità piattaforma", value: 99.9, decimals: 1, suffix: "%", isDemo: true },
];

/** Numero di asset realmente configurati in homepage (utile come controllo). */
export const configuredAssetCount = assetRegistry.length;
