import { AddTask } from "./components/AddTask";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-2">
      <h1 className="text-4xl font-bold text-gray-700 mt-32">Nextjs Todo App</h1>
      <div className="w-full max-w-xl mt-5">
        <div className="w-full bg-white shadow-md rounded-lg p-6 ">
          <AddTask />
        </div>
      </div>
    </main>
  );
}
