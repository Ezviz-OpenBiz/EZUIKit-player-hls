import "./Player.css";
import "@ezuikit/player-hls/dist/style/css.js";
import { useCallback, useEffect, useRef, useState } from "react";
import HlsPlayer from "@ezuikit/player-hls";

// decoder 静态资源（decoder.wasm / decoder.worker.js）放在 public 目录下，
// CRA 会把 public 目录部署到站点根，故 staticPath 指向根目录。
// 软解（或 auto 遇到 H.265 降级软解）时必须提供该目录。
const STATIC_PATH = `${process.env.PUBLIC_URL || ""}/`;

const DEFAULT_URL =
  "https://open.ys7.com/v3/openlive/L28647609_1_2.m3u8?expire=1764644823&id=915914456004136960&t=cbad467c0cc2dcafa9e8b663e1fcee506d0ad9863e931d77b4423a25a6e3130&ev=101&supportH265=1";

function Player() {
  /** @type { React.MutableRefObject<HlsPlayer | null>} */
  const playerRef = useRef(null);
  const [url, setUrl] = useState(DEFAULT_URL);
  const [decoderType, setDecoderType] = useState("auto");
  const [scaleMode, setScaleMode] = useState(1);
  const [volume, setVolume] = useState("");
  const [muted, setMuted] = useState(true);
  const [seekValue, setSeekValue] = useState("");
  const [logs, setLogs] = useState([]);

  const appendLog = useCallback((name, payload, isError = false) => {
    const time = new Date().toLocaleTimeString();
    let text = "";
    if (payload !== undefined) {
      text = typeof payload === "object" ? JSON.stringify(payload) : String(payload);
    }
    setLogs((prev) => [...prev.slice(-199), { time, name, text, isError }]);
  }, []);

  const bindEvents = useCallback(
    (player) => {
      // 事件名参考 README 与 HlsPlayer.HLSEVENTS
      player.on("initSuccess", (info) => appendLog("initSuccess", info));
      player.on("videoInfo", (info) => appendLog("videoInfo", info));
      player.on("audioInfo", (info) => appendLog("audioInfo", info));
      player.on("durationchange", (d) => appendLog("durationchange", d));
      player.on("ended", () => appendLog("ended"));
      player.on("error", (e) => appendLog("error", e, true));
      player.on("media_error", () =>
        appendLog("media_error（触发 auto 降级软解）", undefined, true),
      );
      player.on("network_error", () => appendLog("network_error", undefined, true));
    },
    [appendLog],
  );

  const createPlayer = useCallback(() => {
    if (playerRef.current) return;
    const playUrl = url.trim();
    if (!playUrl) {
      appendLog("请先输入播放地址", undefined, true);
      return;
    }
    playerRef.current = new HlsPlayer({
      id: "player-container",
      url: playUrl,
      staticPath: STATIC_PATH,
      decoderType,
      autoPlay: true,
      muted,
      scaleMode,
      // 如果是萤石平台的 ll-hls 回放地址，需要提供 accessToken，
      // 否则按时间 seek 会报 Missing accessToken
      // accessToken: "xxxx",
    });
    bindEvents(playerRef.current);
  }, [url, decoderType, muted, scaleMode, bindEvents, appendLog]);

  const handleInit = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    createPlayer();
  }, [createPlayer]);

  const handlePlay = useCallback(() => {
    playerRef.current?.play();
  }, []);

  const handlePause = useCallback(() => {
    playerRef.current?.pause();
  }, []);

  const handleDestroy = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
      appendLog("destroy");
    }
  }, [appendLog]);

  const handleFullscreen = useCallback(() => {
    playerRef.current?.fullscreen();
  }, []);

  const handleExitFullscreen = useCallback(() => {
    playerRef.current?.exitFullscreen();
  }, []);

  const handleScreenshot = useCallback(() => {
    // 默认下载 png；也可传 ("snap", "jpeg", 0.7, "base64") 返回 base64
    playerRef.current?.screenshot().then((res) => {
      appendLog("screenshot", res ? "已生成（Blob/已下载）" : "截图失败");
    });
  }, [appendLog]);

  const handleGetVersion = useCallback(() => {
    // 无实例时也可用静态属性 HlsPlayer.version
    appendLog("version", playerRef.current ? playerRef.current.getVersion() : HlsPlayer.version);
  }, [appendLog]);

  const handleSeek = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    const raw = seekValue.trim();
    if (!raw) return;
    // 点播传秒数（number）；萤石回放传时间字符串 YYYYMMDDHHmmss（14 位）
    const value = /^\d+$/.test(raw) && raw.length !== 14 ? Number(raw) : raw;
    Promise.resolve(player.seek(value)).then((ok) => appendLog(`seek → ${value}`, ok));
  }, [seekValue, appendLog]);

  const handleScaleModeChange = useCallback((e) => {
    const mode = Number(e.target.value);
    setScaleMode(mode);
    playerRef.current?.setScaleMode(mode);
  }, []);

  const handleVolumeBlur = useCallback(() => {
    const player = playerRef.current;
    if (!player) {
      appendLog("player 未初始化", undefined, true);
      return;
    }
    const raw = String(volume).trim();
    if (raw === "") return;
    let value = Number(raw);
    if (Number.isNaN(value) || value < 0 || value > 1) {
      appendLog("音量取值范围 [0, 1]", undefined, true);
      return;
    }
    // 只取小数点后两位，不进位（避免 toFixed 四舍五入）
    value = Math.floor(value * 100) / 100;
    setVolume(String(value));
    player.setVolume(value);
  }, [volume, appendLog]);

  const handleMutedChange = useCallback((e) => {
    const next = e.target.checked;
    setMuted(next);
    if (playerRef.current) playerRef.current.muted = next;
  }, []);

  // 卸载组件时销毁播放器，避免内存泄漏
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="player-demo">
      <div className="player-main">
        <div id="player-container"></div>

        <div className="row">
          <input
            className="url-input"
            placeholder="输入 .m3u8 播放地址"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <label>解码</label>
          <select value={decoderType} onChange={(e) => setDecoderType(e.target.value)}>
            <option value="auto">auto</option>
            <option value="hard">hard</option>
            <option value="soft">soft</option>
          </select>
          <button onClick={handleInit}>初始化并播放</button>
        </div>

        <div className="row">
          <button onClick={handlePlay}>播放</button>
          <button onClick={handlePause}>暂停</button>
          <button onClick={handleFullscreen}>全屏</button>
          <button onClick={handleExitFullscreen}>取消全屏（ESC）</button>
          <button onClick={handleScreenshot}>截图</button>
          <button onClick={handleGetVersion}>版本</button>
          <button onClick={handleDestroy}>销毁</button>
        </div>

        <div className="row">
          <label>seek</label>
          <input
            className="seek-input"
            placeholder="点播秒数 或 回放 YYYYMMDDHHmmss"
            value={seekValue}
            onChange={(e) => setSeekValue(e.target.value)}
          />
          <button onClick={handleSeek}>跳转</button>
        </div>

        <div className="row">
          <label>填充</label>
          <select value={scaleMode} onChange={handleScaleModeChange}>
            <option value={1}>1 等比最大边</option>
            <option value={0}>0 完全填充</option>
            <option value={2}>2 等比最小边</option>
          </select>
          <label>音量</label>
          <input
            className="volume-input"
            placeholder="0~1"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            onBlur={handleVolumeBlur}
          />
          <label>
            <input type="checkbox" checked={muted} onChange={handleMutedChange} /> 静音
          </label>
        </div>
      </div>

      <div className="player-panel">
        <h3>事件日志（player.on）</h3>
        <div className="log">
          {logs.map((item, i) => (
            <div key={i}>
              <span className="log-time">[{item.time}]</span>{" "}
              <span className={item.isError ? "log-err" : "log-evt"}>{item.name}</span>{" "}
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Player;
