
import GameScene from "@/components/game/GameScene";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <GameScene />
      </div>
    </main>
  );
}
