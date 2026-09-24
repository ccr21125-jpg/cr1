/**
 * Registro degli asset mostrati in homepage.
 * I prezzi arrivano dai widget: qui stanno solo identità e simboli.
 */
export interface AssetDefinition {
  /** Identificativo interno, usato anche come chiave di React e come id CoinGecko. */
  providerId: string;
  symbol: string;
  name: string;
  /** Colore della monogramma (identità neutra, non il logo ufficiale). */
  tint: string;
}

export const FEATURED_ASSET_ID = "bitcoin";

export const assetRegistry: AssetDefinition[] = [
  { providerId: "bitcoin", symbol: "BTC", name: "Bitcoin", tint: "#E9A24B" },
  { providerId: "ethereum", symbol: "ETH", name: "Ethereum", tint: "#9AA8E8" },
  { providerId: "solana", symbol: "SOL", name: "Solana", tint: "#B58CF0" },
  { providerId: "binancecoin", symbol: "BNB", name: "BNB", tint: "#E8C24A" },
  { providerId: "ripple", symbol: "XRP", name: "XRP", tint: "#B9C4C9" },
  { providerId: "cardano", symbol: "ADA", name: "Cardano", tint: "#6FA3E8" },
];

export const FEATURED_ASSET = assetRegistry.find((a) => a.providerId === FEATURED_ASSET_ID)!;


