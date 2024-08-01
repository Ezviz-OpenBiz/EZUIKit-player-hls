<script setup>
import { onMounted } from 'vue'
import HlsPlayer from '@ezuikit/player-hls';

let player = null

onMounted(() => {
  /** @type {HlsPlayer} */
  player = new HlsPlayer({
    id: 'container',
    url: '',
  })
  // 默认自动播放
  // player.play()
})
</script>

<template>
  <div>
    <div id="container"></div>
  </div>
</template>

<style>
#container {
  width: 600px;
  height: 400px;
  background: #000;
}
</style>
