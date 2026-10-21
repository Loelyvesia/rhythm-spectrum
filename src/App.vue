<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { genres, BPM_MIN, BPM_MAX, type Genre } from './data'

const winMin = ref(60)
const winMax = ref(220)
const selectedName = ref('Drum & Bass')
const playing = ref(false)
let ctx: AudioContext | null = null
let timer: ReturnType<typeof setInterval> | null = null

const selected = computed<Genre>(() => genres.find(g => g.name === selectedName.value) ?? genres[0])

function inWindow(g: Genre) {
  const mid = (g.bpmMin + g.bpmMax) / 2
  return mid >= winMin.value && mid <= winMax.value
}
const visible = computed(() => genres.filter(inWindow))

// dial geometry
const CX = 240, CY = 240, R_MIN = 46, R_MAX = 205
function rOf(bpm: number) { return R_MIN + ((bpm - BPM_MIN) / (BPM_MAX - BPM_MIN)) * (R_MAX - R_MIN) }
function aOf(decade: number) { return -Math.PI / 2 + ((decade - 1900) / 120) * (2 * Math.PI) }
function pt(r: number, a: number) { return [CX + r * Math.cos(a), CY + r * Math.sin(a)] }
function sectorPath(g: Genre) {
  const a0 = aOf(g.decade) - 0.11, a1 = aOf(g.decade) + 0.11
  const r1 = rOf(g.bpmMin), r2 = rOf(g.bpmMax)
  const [x0, y0] = pt(r1, a0), [x1, y1] = pt(r2, a0), [x2, y2] = pt(r2, a1), [x3, y3] = pt(r1, a1)
  return `M${x0},${y0} L${x1},${y1} A${r2},${r2} 0 0 1 ${x2},${y2} L${x3},${y3} A${r1},${r1} 0 0 0 ${x0},${y0} Z`
}
function energyColor(e: number) { return `hsl(${305 - e * 2.4} 90% ${32 + e * 0.45}%)` }

const ticks = [60, 90, 120, 150, 180, 210]

// scatter
const SW = 760, SH = 320, sp = { l: 44, r: 18, t: 18, b: 38 }
const scatter = computed(() =>
  visible.value.map(g => ({
    g,
    x: sp.l + (((g.bpmMin + g.bpmMax) / 2 - BPM_MIN) / (BPM_MAX - BPM_MIN)) * (SW - sp.l - sp.r),
    y: SH - sp.b - (g.energy / 100) * (SH - sp.t - sp.b),
  })),
)

function togglePlay() {
  if (playing.value) {
    stop()
    return
  }
  ctx = ctx || new (window.AudioContext || (window as any).webkitAudioContext)()
  const bpm = (selected.value.bpmMin + selected.value.bpmMax) / 2
  const interval = 60 / bpm
  const next = () => {
    const t = ctx!.currentTime
    const osc = ctx!.createOscillator()
    const gain = ctx!.createGain()
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08)
    osc.connect(gain).connect(ctx!.destination)
    osc.start(t); osc.stop(t + 0.1)
  }
  next()
  timer = setInterval(next, interval * 1000)
  playing.value = true
}
function stop() {
  if (timer) clearInterval(timer)
  timer = null
  playing.value = false
}
onBeforeUnmount(stop)
</script>

<template>
  <main class="app">
    <header class="hero">
      <p class="kicker">数据可视化 · 音乐节拍</p>
      <h1>节律光谱</h1>
      <p class="lede">
        把 24 种音乐流派放进一个「节拍刻度盘」：半径代表 BPM 区间，角度代表起源年代，颜色代表能量。
        拖动 BPM 窗口观察哪些流派落在你的节拍偏好内，点击流派还能试听它的基准节拍。
      </p>
      <p class="note">BPM 与能量为典型参考区间，非官方统计。</p>
    </header>

    <section class="controls">
      <label class="slider">最低 BPM <output>{{ winMin }}</output>
        <input type="range" v-model.number="winMin" :min="60" :max="220" aria-label="最低 BPM" />
      </label>
      <label class="slider">最高 BPM <output>{{ winMax }}</output>
        <input type="range" v-model.number="winMax" :min="60" :max="220" aria-label="最高 BPM" />
      </label>
      <div class="now">
        <strong>{{ selected.name }}</strong>
        <span>{{ selected.bpmMin }}–{{ selected.bpmMax }} BPM · 能量 {{ selected.energy }}</span>
        <button :class="{ playing }" @click="togglePlay">{{ playing ? '停止节拍' : '试听节拍' }}</button>
      </div>
    </section>

    <section class="dial-panel">
      <h2>节拍刻度盘</h2>
      <p class="sub">半径 = BPM，角度 = 起源年代，颜色 = 能量；灰化 = 超出当前 BPM 窗口。</p>
      <svg :viewBox="`0 0 480 480`" class="dial" role="img" aria-label="节拍刻度盘">
        <circle v-for="t in ticks" :key="t" :cx="CX" :cy="CY" :r="rOf(t)" class="ring" />
        <text v-for="t in ticks" :key="'t'+t" :x="CX" :y="CY - rOf(t) - 3" class="ring-label" text-anchor="middle">{{ t }}</text>
        <path
          v-for="g in genres"
          :key="g.name"
          :d="sectorPath(g)"
          :fill="energyColor(g.energy)"
          :opacity="inWindow(g) ? 0.92 : 0.12"
          :stroke="selected.name === g.name ? '#fff' : 'none'"
          :stroke-width="selected.name === g.name ? 2 : 0"
          class="sector"
          @click="selectedName = g.name"
        >
          <title>{{ g.name }} {{ g.bpmMin }}–{{ g.bpmMax }} BPM · 能量 {{ g.energy }}</title>
        </path>
      </svg>
    </section>

    <section class="panel">
      <h2>BPM × 能量</h2>
      <p class="sub">横轴为中值 BPM，纵轴为能量；点击散点切换流派。</p>
      <svg :viewBox="`0 0 ${SW} ${SH}`" class="scatter" role="img" aria-label="BPM 与能量散点图">
        <line :x1="sp.l" :y1="SH-sp.b" :x2="SW-sp.r" :y2="SH-sp.b" class="axis" />
        <line :x1="sp.l" :y1="sp.t" :x2="sp.l" :y2="SH-sp.b" class="axis" />
        <text :x="sp.l+4" :y="SH-sp.b+16" class="tick">60 BPM</text>
        <text :x="SW-sp.r-46" :y="SH-sp.b+16" class="tick">220 BPM</text>
        <circle
          v-for="pt in scatter" :key="pt.g.name"
          :cx="pt.x" :cy="pt.y" :r="selected.name === pt.g.name ? 7 : 5"
          :fill="energyColor(pt.g.energy)" :opacity="0.9"
          @click="selectedName = pt.g.name"
        >
          <title>{{ pt.g.name }} — {{ ((pt.g.bpmMin+pt.g.bpmMax)/2).toFixed(0) }} BPM, 能量 {{ pt.g.energy }}</title>
        </circle>
      </svg>
    </section>

    <footer class="about">
      <h2>关于这份数据</h2>
      <p>
        流派 BPM 区间与能量（0–100）为常见编曲参考的简化值。试听节拍使用 Web Audio 在本地合成单音点击，
        由你的点击手势启动，不联网、不录音。视觉编码：<strong>半径 = BPM，角度 = 年代，颜色 = 能量</strong>。
      </p>
    </footer>
  </main>
</template>

<style>
:root { --bg: #0b0714; --ink: #f0eaff; --muted: #9788b8; --line: #261d38; color-scheme: dark; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: 'Bahnschrift', 'Segoe UI', system-ui, sans-serif; }
.app { max-width: 1120px; margin: 0 auto; padding: 48px 22px 80px; }
.kicker { color: #ff4fd8; letter-spacing: 0.35em; text-transform: uppercase; font-size: 12px; }
h1 { font-size: clamp(44px, 8vw, 86px); margin: 10px 0 14px; line-height: 1; font-weight: 800; letter-spacing: -0.01em; }
.lede { max-width: 64ch; font-size: 17px; line-height: 1.7; color: #cbbfe6; }
.note { color: var(--muted); font-size: 13px; }

.controls { display: flex; flex-wrap: wrap; gap: 22px; align-items: flex-end; margin: 26px 0; }
.slider { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: var(--muted); }
.slider input { width: 190px; accent-color: #ff4fd8; }
.slider output { color: #fff; }
.now { margin-left: auto; display: flex; flex-direction: column; gap: 6px; text-align: right; }
.now strong { font-size: 18px; }
.now span { color: var(--muted); font-size: 13px; }
.now button { margin-top: 4px; background: #2a1640; color: #ff9ae8; border: 1px solid #5a2b6e; border-radius: 999px; padding: 8px 16px; cursor: pointer; font-size: 14px; }
.now button.playing { background: #ff4fd8; color: #1a0a14; border-color: #ff4fd8; }
.now button:focus-visible { outline: 2px solid #ff4fd8; outline-offset: 2px; }

.dial-panel, .panel { background: #100a1e; border: 1px solid var(--line); border-radius: 18px; padding: 22px; margin-top: 22px; }
h2 { margin: 0 0 6px; font-size: 20px; }
.sub { color: var(--muted); font-size: 13px; margin: 0 0 12px; }
.dial { width: 100%; max-width: 520px; height: auto; display: block; margin: 0 auto; }
.ring { fill: none; stroke: #241a38; stroke-width: 1; }
.ring-label { fill: #5e4d82; font-size: 11px; }
.sector { cursor: pointer; transition: opacity 0.15s; }
.sector:hover { opacity: 1 !important; stroke: #fff; stroke-width: 1; }
.scatter { width: 100%; height: auto; }
.axis { stroke: #332647; stroke-width: 1; }
.tick { fill: #6a598c; font-size: 11px; }

.about { margin-top: 42px; border-top: 1px solid var(--line); padding-top: 26px; max-width: 72ch; }
.about p { color: #b3a5ce; line-height: 1.75; }

@media (max-width: 700px) {
  .now { margin-left: 0; text-align: left; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style>
