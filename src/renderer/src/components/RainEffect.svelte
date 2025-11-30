<script lang="ts">
  import { fade } from 'svelte/transition'

  let { rainMode, notepadMode } = $props()

  // Rain Drops
  const dropCount = 100
  const drops = Array.from({ length: dropCount }).map(() => ({
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 0.5 + Math.random() * 0.5,
    opacity: 0.1 + Math.random() * 0.3
  }))
</script>

{#if rainMode}
  <div
    transition:fade={{ duration: 1000 }}
    class="absolute inset-0 pointer-events-none z-0 overflow-hidden"
  >
    {#each drops as drop}
      <div
        class="rain-drop"
        style="left: {drop.left}%; animation-duration: {drop.duration}s; animation-delay: -{drop.delay}s; opacity: {notepadMode
          ? drop.opacity * 2
          : drop.opacity}; background: {notepadMode
          ? 'linear-gradient(to bottom, transparent, rgba(250, 204, 21, 0.5), transparent)'
          : 'linear-gradient(to bottom, transparent, rgba(251, 191, 36, 0.5), transparent)'};"
      ></div>
    {/each}
  </div>
{/if}

<style>
  .rain-drop {
    position: absolute;
    top: -100px;
    width: 1px;
    height: 120px;
    animation-name: rain-fall;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes rain-fall {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(130vh);
    }
  }
</style>
