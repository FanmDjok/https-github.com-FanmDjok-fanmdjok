export type Plan = "gratuit" | "essentiel" | "business";

type PlanLimits = {
  scriptsPerMonth: number | null;
  coachQuestionsPerMonth: number | null;
  connectedNetworks: number | null;
  postsPerMonth: number | null;
  leads: number | null;
  leadMagnets: number | null;
  organizations: number | null;
};

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  gratuit: {
    scriptsPerMonth: 5,
    coachQuestionsPerMonth: 5,
    connectedNetworks: 2,
    postsPerMonth: 10,
    leads: 25,
    leadMagnets: 0,
    organizations: 1,
  },
  essentiel: {
    scriptsPerMonth: null,
    coachQuestionsPerMonth: null,
    connectedNetworks: 4,
    postsPerMonth: null,
    leads: 500,
    leadMagnets: 1,
    organizations: 1,
  },
  business: {
    scriptsPerMonth: null,
    coachQuestionsPerMonth: null,
    connectedNetworks: null,
    postsPerMonth: null,
    leads: 5000,
    leadMagnets: null,
    organizations: 3,
  },
};
