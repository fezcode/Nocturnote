<script lang="ts">
  import { ChevronDown, Check } from 'lucide-svelte';
  import { slide } from 'svelte/transition';

  type Option = { label: string; value: any };

  let { options, value = $bindable(), label = '' } = $props<{
    options: Option[];
    value: any;
    label?: string;
  }>();

  let isOpen = $state(false);

  let selectedLabel = $derived(options.find(o => o.value === value)?.label || value);

  function toggle() {
    isOpen = !isOpen;
  }

  function select(opt: Option) {
    value = opt.value;
    isOpen = false;
  }
</script>

<div class="relative">
  {#if label}
    <label class="text-[11px] font-bold text-[#71717a] uppercase tracking-widest mb-2 block">{label}</label>
  {/if}
  
  <button onclick={toggle} class="w-full h-10 rounded-lg border border-[#2e3245] bg-[#2e3245]/30 flex items-center justify-between px-3 text-sm text-[#f4f4f5] hover:bg-[#2e3245]/50 hover:border-[#3f3f46] transition-all">
    <span class="font-medium">{selectedLabel}</span>
    <ChevronDown size="16" class="text-[#a1a1aa] transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" />
  </button>

  {#if isOpen}
    <div class="fixed inset-0 z-40" onclick={() => isOpen = false} aria-hidden="true"></div>
    <div transition:slide={{ duration: 150 }} class="absolute top-full left-0 right-0 mt-1 bg-[#18181b] border border-[#2e3245] rounded-lg shadow-2xl z-50 overflow-hidden">
      {#each options as opt}
        <button onclick={() => select(opt)} class="w-full h-9 px-3 text-sm text-left flex items-center justify-between hover:bg-[#2e3245]/50 transition-colors {opt.value === value ? 'text-[#818cf8] bg-[#818cf8]/5' : 'text-[#a1a1aa]'}">
          <span>{opt.label}</span>
          {#if opt.value === value}
            <Check size="14" />
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
