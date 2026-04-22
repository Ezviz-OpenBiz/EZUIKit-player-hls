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
import HlsPlayer from "@ezuikit/player-hls";
var player = null;

export default {
  name: "Player",
  props: {
    msg: String,
  },
  data() {
    return {
      url: "https://sqhls3.ys7.com:7993/v3/openlive/BF4904736_1_1.m3u8?expire=1777443506&id=967066858175684608&t=860d4eb3c4257345eb1fcf9ab2b59066ef37e87defdc73b8e1665da2169ce6ce&ev=101&supportH265=1&vc=3&u=38faa8e5801c4464a6e51f4c328f0c88",
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
