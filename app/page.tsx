import { Border } from "@/components/Border";
import { SnakeCanvas } from "@/components/game/SnakeCanvas";
import LinkSegment from "@/components/LinkSegment";
import SecondSegment from "@/components/SecondSegmenet";
import TopSegment from "@/components/TopSegment";

export default function Home() {
  return (
    <div>
      <Border>
        <LinkSegment />
        <TopSegment />
      </Border>

      <SnakeCanvas />

      <Border>
        <SecondSegment />
      </Border>
    </div>
  );
}
