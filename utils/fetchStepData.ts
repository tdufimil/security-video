const STORAGE_KEY_MAP: Record<string, string> = {
  "/data/scenarioA.json": "custom_scenarioA_json",
  "/data/scenarioB.json": "custom_scenarioB_json",
};

export const fetchStepData = async (url: string) => {
  let data;

  // クライアントサイドでlocalStorageをチェック
  if (typeof window !== "undefined") {
    const storageKey = STORAGE_KEY_MAP[url];
    if (storageKey) {
      const customJSON = localStorage.getItem(storageKey);
      if (customJSON) {
        try {
          data = JSON.parse(customJSON);
        } catch (error) {
          console.error("Failed to parse custom JSON from localStorage:", error);
          // パースに失敗したら、通常のfetchに進む
        }
      }
    }
  }

  // localStorageになければ通常のfetch（公開JSON）
  if (!data) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`failed to fetch steps: ${res.status}`);
    data = await res.json();
  }

  // 新しい形式（オブジェクト）の検証
  if (data && typeof data === "object" && "steps" in data) {
    // biometricDataをグローバルに保存
    if (typeof window !== "undefined" && data.biometricData) {
      (window as any).__scenarioBiometricData = data.biometricData;
    }
    return data.steps;
  }

  // 形式が正しくない場合はエラー
  throw new Error("Invalid scenario data format. Expected object with 'steps' property.");
};
