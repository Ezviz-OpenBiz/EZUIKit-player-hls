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
        <button v-on:click="init">初始化并播放</button>
      </div>

      <div class="row">
        <button v-on:click="play">播放</button>
        <button v-on:click="pause">暂停</button>
        <button v-on:click="fullscreen">全屏</button>
        <button v-on:click="exitFullscreen">取消全屏（ESC）</button>
        <button v-on:click="screenshot">截图</button>
        <button v-on:click="getVersion">版本</button>
        <button v-on:click="destroy">销毁</button>
      </div>

      <div class="row">
        <label>seek</label>
        <input
          v-model="seekValue"
          class="seek-input"
          placeholder="点播秒数 或 回放 YYYYMMDDHHmmss"
        />
        <button v-on:click="seek">跳转</button>
      </div>

      <div class="row">
        <label>填充</label>
        <select v-model.number="scaleMode" v-on:change="changeScaleMode">
          <option v-bind:value="1">1 等比最大边</option>
          <option v-bind:value="0">0 完全填充</option>
          <option v-bind:value="2">2 等比最小边</option>
        </select>
        <label>音量</label>
        <input
          v-model="volume"
          class="volume-input"
          placeholder="0~1"
          v-on:blur="setVolume"
        />
        <label>
          <input type="checkbox" v-model="muted" v-on:change="changeMuted" /> 静音
        </label>
      </div>
    </div>

    <div class="player-panel">
      <h3>事件日志（player.on）</h3>
      <div class="log">
        <div v-for="(item, i) in logs" v-bind:key="i">
          <span class="log-time">[{{ item.time }}]</span>
          <span v-bind:class="item.isError ? 'log-err' : 'log-evt'">{{ item.name }}</span>
          {{ item.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "@ezuikit/player-hls/dist/style/css.js";
import HlsPlayer from "@ezuikit/player-hls";

// decoder 静态资源（decoder.wasm / decoder.worker.js）放在 public 目录下，
// Vue CLI 会把 public 目录部署到站点根（publicPath / BASE_URL），故 staticPath 指向该目录。
// 软解（或 auto 遇到 H.265 降级软解）时必须提供该目录。
var STATIC_PATH = process.env.BASE_URL || "/";

var player = null;

export default {
  name: "Player",
  data: function () {
    return {
      url: "https://open.ys7.com/v3/openpb/llhls/BC7799091_1_1.m3u8?begin=20260716000000&end=20260716235959&expire=1784794232&id=997898038200520704&rec=cloud&t=814a7752e1cd06efaa7da5c607971669ba2c92ea11d9a695c428f017e9f83700&ev=101&ownerId=openteam&streamer=alicloud.ys7.com:32723&VideoType=2&StorageVersion=2&supportH265=1",
      decoderType: "auto",
      scaleMode: 1,
      volume: "",
      muted: true,
      seekValue: "",
      logs: [],
    };
  },
  methods: {
    appendLog: function (name, payload, isError) {
      var time = new Date().toLocaleTimeString();
      var text = "";
      if (payload !== undefined) {
        text = typeof payload === "object" ? JSON.stringify(payload) : String(payload);
      }
      this.logs.push({ time: time, name: name, text: text, isError: !!isError });
      if (this.logs.length > 200) this.logs.shift();
    },
    bindEvents: function () {
      var self = this;
      // 事件名参考 README 与 HlsPlayer.HLSEVENTS
      player.on("initSuccess", function (info) {
        self.appendLog("initSuccess", info);
      });
      player.on("videoInfo", function (info) {
        self.appendLog("videoInfo", info);
      });
      player.on("audioInfo", function (info) {
        self.appendLog("audioInfo", info);
      });
      player.on("durationchange", function (d) {
        self.appendLog("durationchange", d);
      });
      player.on("ended", function () {
        self.appendLog("ended");
      });
      player.on("error", function (e) {
        self.appendLog("error", e, true);
      });
      player.on("media_error", function () {
        self.appendLog("media_error（触发 auto 降级软解）", undefined, true);
      });
      player.on("network_error", function () {
        self.appendLog("network_error", undefined, true);
      });
    },
    init: function () {
      if (player) {
        this.destroy();
      }
      var playUrl = (this.url || "").trim();
      if (!playUrl) {
        this.appendLog("请先输入播放地址", undefined, true);
        return;
      }
      // 依赖的解码资源在 public 目录下（软解 / auto 降级软解必需）
      player = new HlsPlayer({
        id: "container",
        url: playUrl,
        staticPath: STATIC_PATH,
        decoderType: this.decoderType,
        autoPlay: true,
        muted: this.muted,
        scaleMode: Number(this.scaleMode),
        loggerOptions: {
          level: "WARN",
        },
        // 如果是萤石平台的 ll-hls 回放地址，需要提供 accessToken，
        // 否则按时间 seek 会报 Missing accessToken
        // accessToken: "xxxx",
      });
      this.bindEvents();
      // 方便调试
      window.player = player;
    },
    play: function () {
      if (player) player.play();
    },
    pause: function () {
      if (player) player.pause();
    },
    fullscreen: function () {
      // 8.2.0 新增，老版本使用 fullScreen()
      if (player) player.fullscreen();
    },
    exitFullscreen: function () {
      if (player) player.exitFullscreen();
    },
    screenshot: function () {
      if (!player) return;
      var self = this;
      // 默认下载 png；也可传 ("snap", "jpeg", 0.7, "base64") 返回 base64
      player.screenshot().then(function (res) {
        self.appendLog("screenshot", res ? "已生成（Blob/已下载）" : "截图失败");
      });
    },
    getVersion: function () {
      // 无实例时也可用静态属性 HlsPlayer.version
      this.appendLog("version", player ? player.getVersion() : HlsPlayer.version);
    },
    seek: function () {
      if (!player) return;
      var raw = (this.seekValue || "").trim();
      if (!raw) return;
      // 点播传秒数（number）；萤石回放传时间字符串 YYYYMMDDHHmmss（14 位）
      var value = /^\d+$/.test(raw) && raw.length !== 14 ? Number(raw) : raw;
      var self = this;
      Promise.resolve(player.seek(value)).then(function (ok) {
        self.appendLog("seek → " + value, ok);
      });
    },
    changeScaleMode: function () {
      if (player) player.setScaleMode(Number(this.scaleMode));
    },
    setVolume: function () {
      if (!player) {
        this.appendLog("player 未初始化", undefined, true);
        return;
      }
      var raw = String(this.volume).trim();
      if (raw === "") return;
      var value = Number(raw);
      if (Number.isNaN(value) || value < 0 || value > 1) {
        this.appendLog("音量取值范围 [0, 1]", undefined, true);
        return;
      }
      // 只取小数点后两位，不进位（避免 toFixed 四舍五入）
      value = Math.floor(value * 100) / 100;
      this.volume = String(value);
      player.setVolume(value);
    },
    changeMuted: function () {
      if (player) player.muted = this.muted;
    },
    destroy: function () {
      if (player) {
        player.destroy();
        player = null;
        this.appendLog("destroy");
      }
    },
  },
  beforeDestroy: function () {
    this.destroy();
  },
};
</script>

<style scoped>
.player-demo {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 16px;
  text-align: left;
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
