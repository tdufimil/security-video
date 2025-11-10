import SecurityQuizClient from "../components/SecurityQuizClient";

export function generateStaticParams() {
  return [{ scenario: "a" }, { scenario: "b" }];
}

export default async function SecurityQuiz({
  params,
}: {
  params: Promise<{ scenario: string }>;
}) {
  // シナリオに応じてJSONファイルのパスを決定
  const { scenario } = await params;
  const dataPath = scenario === "b" ? "/data/stepB.json" : "/data/step.json";

  return <SecurityQuizClient dataPath={dataPath} />;
}
