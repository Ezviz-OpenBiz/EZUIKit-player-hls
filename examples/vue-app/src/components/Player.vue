<script setup>
import "@ezuikit/player-hls/dist/style/css.js";
import { onBeforeUnmount, ref } from "vue";
import HlsPlayer from "@ezuikit/player-hls";

// decoder 静态资源（decoder.wasm / decoder.worker.js）放在 public 目录下，
// Vite 会把 public 目录部署到站点根（BASE_URL），故 staticPath 指向该目录。
// 软解（或 auto 遇到 H.265 降级软解）时必须提供该目录。
const STATIC_PATH = import.meta.env.BASE_URL;

let player = null;

const url = ref(
  "https://open.ys7.com/v3/openlive/L28647609_1_2.m3u8?expire=1764644823&id=915914456004136960&t=cbad467c0cc2dcafa9e8b663e1fcee506d0ad9863e931d77b4423a25a6e3130&ev=101&supportH265=1",
);
const decoderType = ref("auto");
const scaleMode = ref(1);
const volume = ref("");
const muted = ref(true);
const seekValue = ref("");
const logs = ref([]);

const appendLog = (name, payload, isError = false) => {
  const time = new Date().toLocaleTimeString();
  let text = "";
  if (payload !== undefined) {
    text = typeof payload === "object" ? JSON.stringify(payload) : String(payload);
  }
  logs.value.push({ time, name, text, isError });
  if (logs.value.length > 200) logs.value.shift();
};

const bindEvents = () => {
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
};

const init = () => {
  if (player) {
    destroy();
  }

  const playUrl = url.value.trim();
  if (!playUrl) {
    appendLog("请先输入播放地址", undefined, true);
    return;
  }

  /** @type {HlsPlayer} */
  player = new HlsPlayer({
    id: "container",
    url: playUrl,
    staticPath: STATIC_PATH,
    decoderType: decoderType.value,
    autoPlay: true,
    muted: muted.value,
    scaleMode: Number(scaleMode.value),
    // 如果是萤石平台的 ll-hls 回放地址，需要提供 accessToken，
    // 否则按时间 seek 会报 Missing accessToken
    // accessToken: "xxxx",
  });

  bindEvents();
};

const play = () => {
  player?.play();
};

const pause = () => {
  player?.pause();
};

const fullscreen = () => {
  player?.fullscreen();
};

const exitFullscreen = () => {
  player?.exitFullscreen();
};

const screenshot = () => {
  // 默认下载 png；也可传 ("snap", "jpeg", 0.7, "base64") 返回 base64
  player?.screenshot().then((res) => {
    appendLog("screenshot", res ? "已生成（Blob/已下载）" : "截图失败");
  });
};

const getVersion = () => {
  // 无实例时也可用静态属性 HlsPlayer.version
  appendLog("version", player ? player.getVersion() : HlsPlayer.version);
};

const seek = () => {
  if (!player) return;
  const raw = seekValue.value.trim();
  if (!raw) return;
  // 点播传秒数（number）；萤石回放传时间字符串 YYYYMMDDHHmmss（14 位）
  const value = /^\d+$/.test(raw) && raw.length !== 14 ? Number(raw) : raw;
  Promise.resolve(player.seek(value)).then((ok) => appendLog(`seek → ${value}`, ok));
};

const changeScaleMode = () => {
  player?.setScaleMode(Number(scaleMode.value));
};

const setVolume = () => {
  if (!player) {
    appendLog("player 未初始化", undefined, true);
    return;
  }
  const raw = String(volume.value).trim();
  if (raw === "") return;
  let value = Number(raw);
  if (Number.isNaN(value) || value < 0 || value > 1) {
    appendLog("音量取值范围 [0, 1]", undefined, true);
    return;
  }
  // 只取小数点后两位，不进位（避免 toFixed 四舍五入）
  value = Math.floor(value * 100) / 100;
  volume.value = String(value);
  player.setVolume(value);
};

const changeMuted = () => {
  if (player) player.muted = muted.value;
};

const destroy = () => {
  if (player) {
    player.destroy();
    player = null;
    appendLog("destroy");
  }
};

onBeforeUnmount(() => {
  destroy();
});
</script>

<template>
  <div class="player-demo">
    <div class="player-main">
      <div id="container"></div>

      <div class="row">
        <input v-model="url" class="url-input" placeholder="输入 .m3u8 播放地址" />
        <label>解码</label>
        <select v-model="decoderType">
          <option value="auto">auto</option>
          <option value="hard">hard</option>
          <option value="soft">soft</option>
        </select>
        <button @click="init">初始化并播放</button>
      </div>

      <div class="row">
        <button @click="play">播放</button>
        <button @click="pause">暂停</button>
        <button @click="fullscreen">全屏</button>
        <button @click="exitFullscreen">取消全屏（ESC）</button>
        <button @click="screenshot">截图</button>
        <button @click="getVersion">版本</button>
        <button @click="destroy">销毁</button>
      </div>

      <div class="row">
        <label>seek</label>
        <input
          v-model="seekValue"
          class="seek-input"
          placeholder="点播秒数 或 回放 YYYYMMDDHHmmss"
        />
        <button @click="seek">跳转</button>
      </div>

      <div class="row">
        <label>填充</label>
        <select v-model.number="scaleMode" @change="changeScaleMode">
          <option :value="1">1 等比最大边</option>
          <option :value="0">0 完全填充</option>
          <option :value="2">2 等比最小边</option>
        </select>
        <label>音量</label>
        <input
          v-model="volume"
          class="volume-input"
          placeholder="0~1"
          @blur="setVolume"
        />
        <label>
          <input type="checkbox" v-model="muted" @change="changeMuted" /> 静音
        </label>
      </div>
    </div>

    <div class="player-panel">
      <h3>事件日志（player.on）</h3>
      <div class="log">
        <div v-for="(item, i) in logs" :key="i">
          <span class="log-time">[{{ item.time }}]</span>
          <span :class="item.isError ? 'log-err' : 'log-evt'">{{ item.name }}</span>
          {{ item.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-demo {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 16px;
}

.player-main {
  flex: 1 1 620px;
}

#container {
  width: 600px;
  max-width: 100%;
  height: 400px;
  background: #000;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
}

.row label {
  font-size: 13px;
  color: #4e5969;
}

.player-demo input,
.player-demo select {
  padding: 6px 8px;
  border: 1px solid #c9cdd4;
  border-radius: 4px;
  font-size: 13px;
}

.url-input {
  flex: 1 1 360px;
  min-width: 240px;
}

.seek-input {
  width: 220px;
}

.volume-input {
  width: 70px;
}

.player-demo button {
  padding: 6px 12px;
  border: 1px solid #165dff;
  background: #165dff;
  color: #fff;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.player-demo button:hover {
  opacity: 0.9;
}

.player-panel {
  flex: 1 1 360px;
  min-width: 300px;
}

.player-panel h3 {
  font-size: 14px;
  margin-bottom: 8px;
}

.log {
  height: 460px;
  overflow: auto;
  background: #0d1117;
  border-radius: 6px;
  padding: 10px;
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.log-time {
  color: #8b949e;
}

.log-evt {
  color: #7ee787;
}

.log-err {
  color: #ff7b72;
}
</style>
