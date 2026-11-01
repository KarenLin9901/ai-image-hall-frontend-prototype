import { hallScenarioPlans } from './scenario-hall-plans';
import { bespokeScenarioPlans } from './scenario-bespoke-plans';
import type { ScenarioDetail, ScenarioId } from './scenario-plan-types';
export const scenarioPlans: Record<ScenarioId, ScenarioDetail> = { ...hallScenarioPlans, ...bespokeScenarioPlans };
