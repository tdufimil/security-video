export const fetchStepData = async (url:string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`failed to fetch steps: ${res.status}`);
  return res.json();
};
