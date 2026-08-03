<template>
  <div class="hud-overlay">
    <div class="hud-header">
      <div class="brand-title">NEON TETRIS 3D</div>
      
      <div class="cyber-panel stats-card">
        <div class="stat-box">
          <div class="stat-label">SCORE</div>
          <div class="stat-value">{{ score }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">LEVEL</div>
          <div class="stat-value" style="color: #ff007f;">{{ level }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">LINES</div>
          <div class="stat-value" style="color: #ffe600;">{{ lines }}</div>
        </div>
      </div>
    </div>

    <div class="controls-hint">
      <span>🎮 Controls: <strong>← → ↑ ↓</strong> Move/Rotate | <strong>Space</strong> Drop | <strong>A/D</strong> Orbit View</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  score: number;
  level: number;
  lines: number;
}>();
</script>
