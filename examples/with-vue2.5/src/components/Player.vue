<template>
  <div class="ezuikit-hls">
    <div>
      <div id="video-container" style="height: 400px"></div>
    </div>
    <div>
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
  mounted() {
    this.init();
  },
  methods: {
    init() {
      if (player) {
        this.destroy();
      }
      // 依赖的解码资源在 public 目录下 (必须的)
      player = new HlsPlayer({
        id: "video-container", // 视频容器ID
        url: "https://open.ys7.com/v3/openlive/L28647609_1_1.m3u8?expire=1764621652&id=915734222503677952&t=f61fd1b82f26ab47b8e3e6a062a4c5ea80303850f21910f1cedeef908c782b68&ev=101&supportH265=1",
      });
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
