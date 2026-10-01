/**
 * Struttura unica dei dati di conto usata da tutta l'area riservata.
 * Le pagine leggono SOLO da qui: username e saldo non vanno mai riscritti
 * a mano in un componente.
 */
export interface AccountUser {
  /** Identificativo dell'utente autenticato. */
  id: string;
  /** Nome mostrato nei saluti e nelle intestazioni. */
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  city: string | null;
  /**
   * Saldo in satoshi: è il dato di verità.
   *
   * L'importo in euro NON si conserva, si calcola al momento di mostrarlo
   * moltiplicando per il cambio corrente. È l'unico modo perché "se il
   * bitcoin sale del 5% il conto sale del 5%" sia vero per costruzione.
   */
  balanceSats: number;
  /** Valuta in cui il controvalore viene mostrato. */
  currency: "EUR";
  /**
   * Indirizzo del portafoglio creato per il cliente, impostato
   * dall'amministratore. null finché non lo fa: non inventare mai un indirizzo.
   * NON è l'indirizzo di deposito (`depositBtcAddress`).
   */
  walletAddress: string | null;
  /** Indirizzo bitcoin dove il cliente versa denaro (modale "Deposita"). */
  depositBtcAddress: string | null;
  /** null finché l'amministratore non ha impostato le coordinate bancarie. */
  bankDetails: BankDetails | null;
  /** Somma indicativa dichiarata in fase di registrazione. */
  declaredAmount: number | null;
  /** Vero solo se il flag è impostato nel database, mai deducibile dal client. */
  isAdmin: boolean;
  /**
   * false quando la tabella `profiles` non esiste ancora (migrazione non
   * eseguita): l'interfaccia lo dice, invece di mostrare un saldo inventato.
   */
  profileReady: boolean;
  /**
   * Codice dell'errore che ha impedito la lettura, quando ce n'è stato uno.
   * Distingue "tabella assente" da "colonna assente": sono due migrazioni
   * diverse da eseguire, e prima venivano dette entrambe come la prima.
   */
  profileError: string | null;
}

/** Coordinate bancarie per il deposito, impostate dall'amministratore. */
export interface BankDetails {
  name: string | null;
  iban: string | null;
  bic: string | null;
  holder: string | null;
}

/** Riga del registro movimenti. */
export interface LedgerEntry {
  id: string;
  amountSats: number;
  balanceAfterSats: number;
  /** Prezzo di 1 BTC in centesimi al momento del movimento, dove noto. */
  rateEurCents: number | null;
  reason: string;
  createdAt: string;
}

/** Riga dell'elenco utenti nel pannello di amministrazione. */
export interface AdminUserRow {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  city: string | null;
  balanceSats: number;
  currency: string;
  isAdmin: boolean;
  createdAt: string;
  /** Portafoglio del cliente (pagina "Portafogli"). */
  walletAddress: string | null;
  /** Indirizzo bitcoin di deposito. */
  depositBtcAddress: string | null;
  bankDetails: BankDetails | null;
}

/** Stato di una richiesta di prelievo, come definito nell'enum SQL. */
export type WithdrawalStatus = "pending" | "approved" | "rejected" | "cancelled";

/** Richiesta di prelievo, vista dall'utente che l'ha aperta. */
export interface Withdrawal {
  id: string;
  /** Quantità fissata alla richiesta: è ciò che l'utente riceverà. */
  amountSats: number;
  /** Cambio al momento della richiesta, per ricordare cosa aveva chiesto. */
  requestedRateEurCents: number | null;
  /** null quando l'utente non l'ha indicata: si concorda con l'operatore. */
  destination: string | null;
  note: string | null;
  status: WithdrawalStatus;
  /** Motivo scritto dall'amministratore: presente solo sui rifiuti. */
  decisionReason: string | null;
  decidedAt: string | null;
  createdAt: string;
}

/** La stessa richiesta vista dal pannello, con l'utente a cui appartiene. */
export interface AdminWithdrawal extends Withdrawal {
  userId: string;
  userEmail: string;
  userName: string | null;
  decidedBy: string | null;
}
