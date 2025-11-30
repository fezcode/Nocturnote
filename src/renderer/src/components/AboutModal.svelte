<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, scale } from 'svelte/transition'
  import { Github, Globe } from 'lucide-svelte'

  let { showAbout = $bindable() } = $props<{
    showAbout: boolean
  }>()

  let appVersion = $state('')

  onMount(async () => {
    try {
      appVersion = await window.api.getAppVersion()
    } catch (e) {
      appVersion = 'Dev'
    }
  })
</script>

{#if showAbout}
  <div
    transition:fade={{ duration: 150 }}
    class="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm no-drag"
    onclick={() => (showAbout = false)}
  >
    <div
      transition:scale={{ duration: 200, start: 0.95 }}
      class="w-[400px] bg-[#18181b] border border-[#2e3245] rounded-xl shadow-2xl overflow-hidden"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div
        class="px-6 py-4 border-b border-[#2e3245] flex justify-between items-center bg-[#0e1019]"
      >
        <h2 class="text-sm font-semibold tracking-wide text-[#f4f4f5]">About</h2>
        <button
          onclick={() => (showAbout = false)}
          class="text-[#71717a] hover:text-[#f4f4f5] transition-colors text-xs uppercase tracking-wider font-bold"
          >Close</button
        >
      </div>

      <!-- Content -->
      <div class="p-8 flex flex-col items-center text-center space-y-6">
        <!-- Logo/Icon Placeholder -->
        <div
          class="w-20 h-20 bg-gradient-to-br from-[#818cf8] to-[#6366f1] rounded-2xl flex items-center justify-center shadow-lg shadow-[#818cf8]/20 mb-2"
        >
          <img src="/icon.png" alt="App Icon" class="w-20 h-20" />
        </div>

        <div class="space-y-2">
          <h1 class="text-2xl font-bold text-white tracking-tight">Nocturnote</h1>
          <p class="text-[#a1a1aa] text-sm">Simple, distraction-free text editing.</p>
        </div>

        <div
          class="flex items-center justify-center gap-3 text-xs font-mono text-[#71717a] bg-[#2e3245]/30 px-3 py-1.5 rounded-full border border-[#2e3245]"
        >
          <span>v{appVersion}</span>
          <span class="w-px h-3 bg-[#71717a]/30"></span>
          <span>{window.api.platform === 'win32' ? 'Windows' : 'Mac/Linux'}</span>
        </div>

        <div class="grid grid-cols-2 gap-3 w-full pt-4">
          <a
            href="https://github.com/fezcode/nocturnote"
            target="_blank"
            class="flex items-center justify-center gap-2 h-10 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#e4e4e7] transition-colors text-sm font-medium"
          >
            <Github size="16" />
            <span>GitHub</span>
          </a>
          <a
            href="https://fezcode.com"
            target="_blank"
            class="flex items-center justify-center gap-2 h-10 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#e4e4e7] transition-colors text-sm font-medium"
          >
            <Globe size="16" />
            <span>fezcode.com</span>
          </a>
        </div>

        <div class="pt-4 text-[10px] text-[#52525b]">
          <p>Copyright © 2025 fezcode. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
{/if}
