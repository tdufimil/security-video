const STORAGE_KEY_MAP: Record<string, string> = {
  "/data/step.json": "custom_step_json",
  "/data/stepB.json": "custom_stepB_json",
};

export const fetchStepData = async (url: string) => {
  // クライアントサイドでlocalStorageをチェック
  if (typeof window !== "undefined") {
    const storageKey = STORAGE_KEY_MAP[url];
    if (storageKey) {
      const customJSON = localStorage.getItem(storageKey);
      if (customJSON) {
        try {
          return JSON.parse(customJSON);
        } catch (error) {
          console.error("Failed to parse custom JSON from localStorage:", error);
          // パースに失敗したら、通常のfetchに進む
        }
      }
    }
  }

  // 通常のfetch（公開JSON）
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`failed to fetch steps: ${res.status}`);
  return res.json();
};
