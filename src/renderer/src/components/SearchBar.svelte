<script lang="ts">
  import { fly, slide } from 'svelte/transition'
  import { ChevronRight, ChevronUp, ChevronDown, X, ArrowLeftRight, CopyPlus } from 'lucide-svelte'

  let {
    showSearch = $bindable(),
    showReplace = $bindable(),
    searchQuery = $bindable(),
    replaceQuery = $bindable(),
    notepadMode,
    performSearch,
    toggleSearch,
    replaceCurrent,
    replaceAll,
    handleSearchKeydown
  } = $props<{
    showSearch: boolean
    showReplace: boolean
    searchQuery: string
    replaceQuery: string
    notepadMode: boolean
    performSearch: (dir: 'next' | 'prev', stealFocus: boolean, forceFirst: boolean) => void
    toggleSearch: () => void
    replaceCurrent: () => void
    replaceAll: () => void
    handleSearchKeydown: (e: KeyboardEvent) => void
  }>()

  let searchInputRef: HTMLInputElement

  $effect(() => {
    if (showSearch && searchInputRef) {
      searchInputRef.focus()
    }
  })
</script>

{#if showSearch}
  <div
    transition:fly={{ y: -10, duration: 150 }}
    class="absolute top-16 right-6 z-[60] flex flex-col gap-1 p-1 rounded-lg border shadow-xl {notepadMode
      ? 'bg-white border-gray-200'
      : 'bg-[#18181b] border-[#2e3245]'}"
  >
    <div class="flex items-center gap-1">
      <button
        onclick={() => (showReplace = !showReplace)}
        class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 {notepadMode
          ? 'text-gray-500'
          : 'text-gray-400'} transition-transform duration-200"
        style="transform: rotate({showReplace ? '90deg' : '0deg'})"
      >
        <ChevronRight size="14" strokeWidth={2} />
      </button>
      <input
        bind:this={searchInputRef}
        bind:value={searchQuery}
        oninput={() => performSearch('next', false, true)}
        onkeydown={handleSearchKeydown}
        placeholder="Find..."
        class="w-48 h-8 px-2 text-sm bg-transparent outline-none {notepadMode
          ? 'text-gray-800 placeholder-gray-400'
          : 'text-white placeholder-gray-600'}"
      />
      <div class="h-4 w-px {notepadMode ? 'bg-gray-200' : 'bg-[#2e3245]'}"></div>
      <button
        onclick={() => performSearch('prev', false, false)}
        class="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 {notepadMode
          ? 'text-gray-500'
          : 'text-gray-400'}"
      >
        <ChevronUp size="14" strokeWidth={2} />
      </button>
      <button
        onclick={() => performSearch('next', false, false)}
        class="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 {notepadMode
          ? 'text-gray-500'
          : 'text-gray-400'}"
      >
        <ChevronDown size="14" strokeWidth={2} />
      </button>
      <button
        onclick={toggleSearch}
        class="p-1.5 rounded hover:bg-red-500/10 hover:text-red-500 {notepadMode
          ? 'text-gray-400'
          : 'text-gray-500'}"
      >
        <X size="14" strokeWidth={2} />
      </button>
    </div>
    {#if showReplace}
      <div
        transition:slide={{ duration: 150 }}
        class="flex items-center gap-1 border-t {notepadMode
          ? 'border-gray-200'
          : 'border-[#2e3245]'} pt-1 mt-1"
      >
        <div class="w-[22px]"></div>
        <input
          bind:value={replaceQuery}
          placeholder="Replace..."
          class="w-36 h-8 px-2 text-sm bg-transparent outline-none {notepadMode
            ? 'text-gray-800 placeholder-gray-400'
            : 'text-white placeholder-gray-600'}"
        />
        <button
          onclick={replaceCurrent}
          title="Replace"
          class="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 {notepadMode
            ? 'text-gray-500'
            : 'text-gray-400'}"
        >
          <ArrowLeftRight size="14" strokeWidth={2} />
        </button>
        <button
          onclick={replaceAll}
          title="Replace All"
          class="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 {notepadMode
            ? 'text-gray-500'
            : 'text-gray-400'}"
        >
          <CopyPlus size="14" strokeWidth={2} />
        </button>
      </div>
    {/if}
  </div>
{/if}
