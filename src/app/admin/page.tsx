"use client";

import { useState, useEffect } from "react";

const STORAGE_KEYS = {
  scenarioA: "custom_scenarioA_json",
  scenarioB: "custom_scenarioB_json",
};

const FILE_PATHS = {
  scenarioA: "/data/scenarioA.json",
  scenarioB: "/data/scenarioB.json",
};

export default function AdminPage() {
  const [selectedFile, setSelectedFile] = useState<"scenarioA" | "scenarioB">("scenarioA");
  const [jsonContent, setJsonContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isCustomized, setIsCustomized] = useState(false);

  // 選択したファイルの内容を読み込む
  useEffect(() => {
    loadJSON();
  }, [selectedFile]);

  const loadJSON = async () => {
    setLoading(true);
    setMessage("");
    try {
      const storageKey = STORAGE_KEYS[selectedFile];
      const customJSON = localStorage.getItem(storageKey);

      if (customJSON) {
        setJsonContent(customJSON);
        setIsCustomized(true);
      } else {
        const response = await fetch(FILE_PATHS[selectedFile]);
        const data = await response.json();
        setJsonContent(JSON.stringify(data, null, 2));
        setIsCustomized(false);
      }
    } catch (error) {
      setMessage(`エラー: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    try {
      // JSONの妥当性チェック
      JSON.parse(jsonContent);

      const storageKey = STORAGE_KEYS[selectedFile];
      localStorage.setItem(storageKey, jsonContent);
      setIsCustomized(true);
      setMessage("保存しました！");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`JSONエラー: ${error}`);
    }
  };

  const handleReset = () => {
    if (confirm("カスタマイズをリセットして、公開JSONに戻しますか？")) {
      const storageKey = STORAGE_KEYS[selectedFile];
      localStorage.removeItem(storageKey);
      loadJSON();
      setMessage("リセットしました！");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsed, null, 2));
      setMessage("整形しました！");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`JSONエラー: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          JSON Editor - 管理画面
        </h1>

        {/* ファイル選択 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            編集するファイル:
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedFile("scenarioA")}
              className={`px-4 py-2 rounded ${
                selectedFile === "scenarioA"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              scenarioA.json (シナリオ A)
            </button>
            <button
              onClick={() => setSelectedFile("scenarioB")}
              className={`px-4 py-2 rounded ${
                selectedFile === "scenarioB"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              scenarioB.json (シナリオ B)
            </button>
          </div>
          {isCustomized && (
            <div className="mt-2 text-sm text-orange-600 font-medium">
              ⚠ カスタマイズ版を編集中（localStorage）
            </div>
          )}
        </div>

        {/* エディタ */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              JSON内容:
            </label>
            <button
              onClick={handleFormat}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              整形
            </button>
          </div>

          <textarea
            value={jsonContent}
            onChange={(e) => setJsonContent(e.target.value)}
            className="w-full h-96 font-mono text-sm p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />

          {message && (
            <div
              className={`mt-4 p-3 rounded ${
                message.includes("エラー")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* アクション */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            保存（localStorage）
          </button>
          <button
            onClick={handleReset}
            disabled={loading || !isCustomized}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            リセット（公開JSONに戻す）
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium inline-block"
          >
            ホームに戻る
          </a>
        </div>

        {/* 使い方 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-2">使い方</h2>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>テキストエリアでJSONを直接編集できます</li>
            <li>
              「保存」するとlocalStorageに保存され、次回以降カスタマイズ版が読み込まれます
            </li>
            <li>「リセット」すると公開JSONに戻ります</li>
            <li>「整形」でJSONをきれいに整形できます</li>
            <li>シナリオA (/a) とシナリオB (/b) を個別に編集できます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
