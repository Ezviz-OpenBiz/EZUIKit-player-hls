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
      // 依赖的解码资源在 public 目录下 (必须的)
      playerRef.current = new HlsPlayer({
        id: "player-container",
        url,
      });
      // 默认自动播放
      // playerRef.current.play();
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
            defaultValue="https://open.ys7.com/v3/openlive/L28647609_1_1.m3u8?expire=1764621652&id=915734222503677952&t=f61fd1b82f26ab47b8e3e6a062a4c5ea80303850f21910f1cedeef908c782b68&ev=101&supportH265=1"
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
