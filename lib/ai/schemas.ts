import { z } from "zod";

export const IdeasSchema = z.object({
  ideas: z
    .array(
      z.object({
        objective: z.enum(["Attirer", "Rassurer", "Convertir"]),
        title: z.string(),
        format: z.enum(["Reel", "Carrousel", "Story", "Post"]),
      }),
    )
    .length(5),
});
export type Ideas = z.infer<typeof IdeasSchema>;

export const ScriptSchema = z.object({
  title: z.string(),
  hook: z.string().describe("Accroche des 3 premières secondes"),
  body: z.string().describe("Développement du script"),
  cta: z.string().describe("Appel à l'action relié à la page de l'utilisateur"),
});
export type GeneratedScript = z.infer<typeof ScriptSchema>;

export const CarouselSchema = z.object({
  title: z.string(),
  caption: z.string().describe("Légende à publier avec le carrousel"),
  slides: z.array(z.string()).length(8),
});
export type GeneratedCarousel = z.infer<typeof CarouselSchema>;

export const CoachReplySchema = z.object({
  reply: z.string().describe("Réponse du conseiller, concrète et vouvoyée"),
});
export type CoachReply = z.infer<typeof CoachReplySchema>;

export const LeadMagnetPlanSchema = z.object({
  title: z.string(),
  sections: z
    .array(
      z.object({
        title: z.string(),
        body: z.string().describe("Contenu de la section, quelques phrases concrètes"),
      }),
    )
    .min(4)
    .max(8),
});
export type LeadMagnetPlan = z.infer<typeof LeadMagnetPlanSchema>;

export const ReactivationMessageSchema = z.object({
  message: z.string().describe("Message de relance court, prêt à envoyer"),
});
export type ReactivationMessage = z.infer<typeof ReactivationMessageSchema>;

export const CaptionAdaptationSchema = z.object({
  caption: z.string().describe("Légende adaptée au réseau demandé"),
});
export type CaptionAdaptation = z.infer<typeof CaptionAdaptationSchema>;

export const MesurerInsightSchema = z.object({
  insight: z.string().describe("Lecture concrète des statistiques, avec une recommandation"),
});
export type MesurerInsight = z.infer<typeof MesurerInsightSchema>;

export const PostAnalysisSchema = z.object({
  priority: z.string().describe("Priorité d'amélioration concrète pour cette publication"),
});
export type PostAnalysisPriority = z.infer<typeof PostAnalysisSchema>;
