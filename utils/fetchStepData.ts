export const fetchStepData = async () => {
  const res = await fetch("/data/step.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`failed to fetch steps: ${res.status}`);
  return res.json();
};
