<script setup>
import { onMounted } from 'vue'
import HLSPlayer from '@ezuikit/player-hls';

let player = null

onMounted(() => {
  player = new HLSPlayer({
    container: 'container',
    url: 'https://open.ys7.com/v3/openlive/E71992743_1_1.m3u8',
    decoder: 'decoder.js' // 软解解码资源 （wasm 要和js 在同一个文件夹中）
  })
  player.play()
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
