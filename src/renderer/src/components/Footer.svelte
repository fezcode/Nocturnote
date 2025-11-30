<script lang="ts">
  import { fade } from 'svelte/transition'

  let {
    content,
    notepadMode,
    statusMessage,
    showSearch,
    searchFeedback,
    textAreaRef,
    currentLine,
    currentCol
  } = $props<{
    content: string
    notepadMode: boolean
    statusMessage: string
    showSearch: boolean
    searchFeedback: string
    textAreaRef: HTMLTextAreaElement
    currentLine: number
    currentCol: number
  }>()
</script>

<footer
  class="h-9 flex items-center justify-between px-4 text-xs select-none z-50 border-t transition-colors duration-500 relative shrink-0 {notepadMode
    ? 'bg-[#fdfbf7] border-gray-300 text-gray-500'
    : 'bg-[#0e1019] border-[#2e3245] text-[#52525b]'}"
>
  <div class="flex gap-4 font-mono w-1/3">
    <span>Ln {currentLine}</span><span>Col {currentCol}</span>
  </div>
  <div
    class="absolute left-1/2 -translate-x-1/2 font-mono uppercase tracking-[0.2em] pointer-events-none {notepadMode
      ? 'text-pink-600'
      : 'text-[#818cf8]'} opacity-80 whitespace-nowrap"
  >
    {#if statusMessage}
      <span transition:fade={{ duration: 150 }}>{statusMessage}</span>
    {:else if showSearch && searchFeedback}
      <span
        transition:fade={{ duration: 150 }}
        class={notepadMode ? 'text-orange-500' : 'text-[#fbbf24]'}>{searchFeedback}</span
      >
    {/if}
  </div>
  <div class="flex gap-4 font-mono w-1/3 justify-end">
    <span>UTF-8</span><span>{content.length} chars</span>
  </div>
</footer>
