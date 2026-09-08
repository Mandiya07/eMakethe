// Feature Flags for Emakethe V2 MVP
// Core MVP features remain enabled, while experimental/premature modules are safely disabled.

export const FEATURES = {
  // Emakethe Wallet is disabled until a fully compliant server-side ledger and regulatory licensing is deployed.
  EMAKETHE_WALLET: false,

  // Escrow claims are disabled for MVP. Direct payments move through UNPAID -> PENDING -> PAID -> FAILED -> CANCELLED.
  ESCROW: false,

  // Buy-Now-Pay-Later is disabled for Phase 1 MVP.
  BNPL: false,

  // Independent driver delivery network is placed behind a flag for Phase 2 rollout.
  DRIVER_NETWORK: false,

  // Advanced advertising monetization engine
  ADVANCED_ADS: false,

  // Native chat is optional; WhatsApp-first communication is primary for MVP.
  NATIVE_CHAT: true,
  
  // AI-assisted listings and coaching for informal traders
  AI_ASSISTANT: true,
};
