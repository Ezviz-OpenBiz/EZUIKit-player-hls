<template>
  <div class="ezuikit-hls">
    <div>
      <div id="video-container" style="height: 400px"></div>
    </div>
    <div>
      <input v-model="url" placeholder="请输入视频 URL" style="width: 600px; margin-right: 8px;" />
      <button v-on:click="init">init</button>
      <button v-on:click="pause">pause</button>
      <button v-on:click="play">play</button>
      <button v-on:click="fullscreen">fullscreen</button>
      <button v-on:click="destroy">destroy</button>
    </div>
  </div>
</template>

<script>
import "@ezuikit/player-hls/dist/style/css.js";
import HlsPlayer from "@ezuikit/player-hls";
var player = null;

export default {
  name: "Player",
  props: {
    msg: String,
  },
  data() {
    return {
      url: "https://open.ys7.com/v3/openpb/llhls/BC7799091_1_1.m3u8?begin=20260716000000&end=20260716235959&expire=1784794232&id=997898038200520704&rec=cloud&t=814a7752e1cd06efaa7da5c607971669ba2c92ea11d9a695c428f017e9f83700&ev=101&ownerId=openteam&streamer=alicloud.ys7.com:32723&VideoType=2&StorageVersion=2&supportH265=1",
    };
  },
  mounted() {
    // this.init();
  },
  methods: {
    init() {
      if (player) {
        this.destroy();
      }
      // 依赖的解码资源在 public 目录下 (必须的)
      player = new HlsPlayer({
        id: "video-container", // 视频容器ID
        url: this.url,
        loggerOptions: {
          level: "WARN",
        },
        // decoderType: "soft",
        // 如果是萤石平台的ll-hls回放地址, 需要提供 accessToken， 为了方便暂停后重新回去新的地址进行播放， 不然会报 Missing accessToken
      });

      player.event.on("videoInfo", (info) => {
        console.warn("videoInfo: ", info)
      })
      // 默认自动播放
      // player.play()
      window.player = player;
    },
    play() {
      if(player)
        player.play()
    },
    pause() {
      if(player)
        player.pause();
    },
    fullscreen() {
      if(player) player.fullscreen(); // 8.2.0 新增, 老版本使用 fullScreen()
    },
    destroy() {
      if(player) {
        player.destroy()
        player = null;
      }
    },
  },
};
</script>
