import { Border } from "@/components/Border";
import { Canvas } from "@/components/game/Canvas";
import SpanningTree from "@/components/game/Snake/spanningTree";
import LinkSegment from "@/components/LinkSegment";
import TopSegment from "@/components/TopSegment";

export default function Home() {
  return (
    <div>
      <Border>
        <LinkSegment />
        <TopSegment />
      </Border>

      <Canvas />
      <SpanningTree />
    </div>
  );
}
