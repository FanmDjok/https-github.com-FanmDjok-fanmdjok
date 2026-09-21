export type Plan = "gratuit" | "essentiel" | "business";

export const PLAN_LIMITS: Record<Plan, { scriptsPerMonth: number | null; coachQuestionsPerMonth: number | null }> = {
  gratuit: { scriptsPerMonth: 5, coachQuestionsPerMonth: 5 },
  essentiel: { scriptsPerMonth: null, coachQuestionsPerMonth: null },
  business: { scriptsPerMonth: null, coachQuestionsPerMonth: null },
};
