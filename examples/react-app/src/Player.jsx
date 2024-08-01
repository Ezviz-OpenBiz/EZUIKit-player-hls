import "./Player.css";
import { useCallback, useEffect, useRef } from "react";
import HlsPlayer from "@ezuikit/player-hls";

function Player() {
  /** @type { React.MutableRefObject<HlsPlayer>} */
  const playerRef = useRef();
  const urlRef = useRef();
  const containerRef = useRef();
  const volumeRef = useRef();

  useEffect(() => {
    volumeRef.current.addEventListener("blur", (e) => {
      if (playerRef.current) {
        let value = (e.target.value || "").trim();
        if (value === "") {
          console.error("音量为空");
          return;
        }
        value = Number(value);
        if (value > 1 || value < 0) {
          console.error("音量设置错误， 取值范围在[0,1]");
          return;
        }

        value = parseInt((value * 100 + "").split(".")[0]) / 100; // 不使用 toFixed 是为了避免四舍五入问题
        playerRef.current.setVolume(value);
      } else {
        console.log("player 未初始化");
      }
    });
  }, []);

  const createPlayer = () => {
    const url = urlRef.current.value;
    if (!playerRef.current) {
      playerRef.current = new HlsPlayer({
        id: "player-container",
        url,
      });
      playerRef.current.play();
    }
  };

  const handleInIt = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    createPlayer();
  }, []);

  const handlePlay = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.play();
    }
  }, []);

  const handlePause = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
  }, []);

  const handleDestroy = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.fullscreen();
    }
  }, []);

  const handleExitFullscreen = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.exitFullscreen();
    }
  }, []);

  const handleGetVersion = useCallback(() => {
    if (playerRef.current) {
      console.log(playerRef.current.getVersion());
    }
  }, []);

  return (
    <div>
      <div id="player-container" ref={containerRef}></div>
      <div>
        <div>
          <input
            style={{ width: 600 }}
            placeholder="输入播放地址"
            ref={urlRef}
            defaultValue=""
          />
        </div>
        <div>
          <button onClick={handleInIt}>init</button>
          <button onClick={handlePlay}>播放</button>
          <button onClick={handlePause}>暂停</button>
          <button onClick={handleFullscreen}>开启全屏</button>
          <button onClick={handleExitFullscreen}>取消全屏（ESC）</button>
          <button onClick={handleGetVersion}>获取版本</button>
          <button onClick={handleDestroy}>销毁</button>
        </div>
        <div>
          音量：
          <input ref={volumeRef} placeholder="0-1" />
        </div>
      </div>
    </div>
  );
}

export default Player;
