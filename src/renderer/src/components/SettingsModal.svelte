<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, scale } from 'svelte/transition'
  import type { AppSettings } from '../types'
  import Dropdown from './Dropdown.svelte'
  import Toggle from './Toggle.svelte'
  import Range from './Range.svelte'

  let { showSettings = $bindable(), settings = $bindable() } = $props<{
    showSettings: boolean
    settings: AppSettings
  }>()

  let appVersion = $state('')

  onMount(async () => {
    appVersion = await window.api.getAppVersion()
  })

  const fontOptions = [
    {
      label: 'Modern Mono',
      value: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace"
    },
    { label: 'Classic Console', value: "Consolas, 'Liberation Mono', Menlo, Courier, monospace" },
    {
      label: 'Clean Sans',
      value:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    },
    { label: 'Elegant Serif', value: "Charter, 'Bitstream Charter', 'Sitka Text', Cambria, serif" }
  ]

  const weightOptions = [
    { label: 'Light', value: 300 },
    { label: 'Normal', value: 400 },
    { label: 'Medium', value: 500 }
  ]

  const themeOptions = [
    { label: 'Dark', value: 'dark' },
    { label: 'Light', value: 'light' },
    { label: 'Midnight', value: 'midnight' },
    { label: 'Forest', value: 'forest' }
  ]
</script>

{#if showSettings}
  <div
    transition:fade={{ duration: 150 }}
    class="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm no-drag"
    onclick={() => (showSettings = false)}
  >
    <div
      transition:scale={{ duration: 200, start: 0.95 }}
      class="w-[440px] bg-[#18181b] border border-[#2e3245] rounded-xl shadow-2xl overflow-hidden"
      onclick={(e) => e.stopPropagation()}
    >
      <div
        class="px-6 py-4 border-b border-[#2e3245] flex justify-between items-center bg-[#0e1019]"
      >
        <h2 class="text-sm font-semibold tracking-wide text-[#f4f4f5]">
          Appearance <span class="ml-2 text-[10px] font-normal text-[#71717a] opacity-60"
            >v{appVersion}</span
          >
        </h2>
        <button
          onclick={() => (showSettings = false)}
          class="text-[#71717a] hover:text-[#f4f4f5] transition-colors text-xs uppercase tracking-wider font-bold"
          >Close</button
        >
      </div>
      <div class="p-6 space-y-6">
        <Dropdown label="Theme" options={themeOptions} bind:value={settings.theme} />

        <Dropdown label="Typography" options={fontOptions} bind:value={settings.fontFamily} />

        <Dropdown label="Weight" options={weightOptions} bind:value={settings.fontWeight} />

        <div class="space-y-5 pt-2">
          <Range
            label="Font Size"
            min={12}
            max={32}
            step={1}
            bind:value={settings.fontSize}
            displayFormat={(v) => `${v}px`}
          />
          <Range
            label="Line Height"
            min={1.0}
            max={2.5}
            step={0.1}
            bind:value={settings.lineHeight}
          />
        </div>

        <div class="pt-6 border-t border-[#2e3245] space-y-3">
          <Toggle label="Word Wrap" bind:checked={settings.wordWrap} />
          <Toggle label="Line Numbers" bind:checked={settings.showLineNumbers} />
        </div>
      </div>
    </div>
  </div>
{/if}
