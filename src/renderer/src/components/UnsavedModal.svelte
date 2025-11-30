<script lang="ts">
  import { fade, scale } from 'svelte/transition'

  let {
    showUnsavedDialog = $bindable(),
    notepadMode,
    fileName,
    onSave,
    onDontSave,
    onCancel
  } = $props<{
    showUnsavedDialog: boolean
    notepadMode: boolean
    fileName: string
    onSave: () => void
    onDontSave: () => void
    onCancel: () => void
  }>()
</script>

{#if showUnsavedDialog}
  <div
    transition:fade={{ duration: 150 }}
    class="absolute inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm no-drag"
    onclick={() => {
      /* Modal backdrop click does nothing to force choice */
    }}
  >
    <div
      transition:scale={{ duration: 200, start: 0.95 }}
      class="w-[350px] {notepadMode
        ? 'bg-white border-gray-200'
        : 'bg-[#18181b] border-[#2e3245]'} border rounded-xl shadow-2xl overflow-hidden p-6"
      onclick={(e) => e.stopPropagation()}
    >
      <h3 class="text-lg font-semibold mb-2 {notepadMode ? 'text-gray-900' : 'text-[#f4f4f5]'}">
        Unsaved Changes
      </h3>
      <p class="text-sm mb-6 {notepadMode ? 'text-gray-600' : 'text-[#a1a1aa]'}">
        You have unsaved changes in <span
          class="font-medium {notepadMode ? 'text-gray-800' : 'text-white'}">{fileName}</span
        >. Do you want to save them?
      </p>
      <div class="flex justify-end gap-3">
        <button
          onclick={onDontSave}
          class="px-4 py-2 text-sm font-medium rounded-lg transition-colors {notepadMode
            ? 'text-red-600 hover:bg-red-50'
            : 'text-red-400 hover:bg-red-500/10'}">Don't Save</button
        >
        <button
          onclick={onCancel}
          class="px-4 py-2 text-sm font-medium rounded-lg transition-colors {notepadMode
            ? 'text-gray-600 hover:bg-gray-100'
            : 'text-[#a1a1aa] hover:bg-[#27272a]'}">Cancel</button
        >
        <button
          onclick={onSave}
          class="px-4 py-2 text-sm font-medium rounded-lg text-white bg-[#818cf8] hover:bg-[#6366f1] transition-colors shadow-lg shadow-[#818cf8]/20"
          >Save</button
        >
      </div>
    </div>
  </div>
{/if}
