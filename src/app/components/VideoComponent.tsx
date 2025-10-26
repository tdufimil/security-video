import { Dispatch, SetStateAction, useRef } from "react";
import { Video } from "../../../hooks/useStepController";

type Props = {
  videoData: Video;
  setCurrentId: Dispatch<SetStateAction<string>>;
};



export default function VideoComponent({ videoData, setCurrentId }: Props) {
   const videoRef = useRef<HTMLVideoElement | null>(null);

    // 再生終了時の処理
  const handleVideoEnded = () => {
    console.log(videoData);
    if (videoData.next) {
      console.log(`[VideoComponent] 動画終了 → 次のステップへ: ${videoData.next}`);
      setCurrentId(videoData.next);
    } else {
      console.warn("[VideoComponent] nextが未定義のため遷移できません");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <video
        ref={videoRef}
        src={videoData.src}
        controls
        autoPlay
        className="w-screen h-screen object-cover"
        onEnded={handleVideoEnded}
      />
    </div>
  );
}
