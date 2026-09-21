import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Modèle par défaut pour toute génération de texte (positionnement, idées,
// scripts, carrousels, légendes, conseiller). Growthis ne génère jamais de
// vidéo ni d'image par IA.
export const AI_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";
