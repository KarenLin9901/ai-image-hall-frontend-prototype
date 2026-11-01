export type ScenarioId = 'event' | 'team' | 'campus' | 'person' | 'family' | 'enterprise' | 'city';
export type PlanVisual = { src: string; alt: string; caption: string };
export type PlanPoint = { title: string; description: string };
export type ScenarioChoice = {
  id: string;
  title: string;
  meaning: string;
  options: { id: string; label: string; meaning: string; result: string }[];
};
/** Product proposal explanations, never generation parameters or confirmed service promises. */
export type ScenarioDetail = {
  id: ScenarioId;
  business: 'hall' | 'bespoke';
  lead: string;
  organizer: string;
  participants: string;
  setting: string;
  objective: string;
  highlights: PlanPoint[];
  mechanic: { title: string; description: string; fixed: string[]; personal: string[] };
  narrative: PlanPoint[];
  choices: ScenarioChoice[];
  journey: PlanPoint[];
  outputs: { recipient: string; title: string; items: string[]; value: string }[];
  scope: { core: string; optional: string[]; pending: string[] };
  preparation: string[];
  visuals: { hero: PlanVisual; detail: PlanVisual; outcome: PlanVisual };
};
