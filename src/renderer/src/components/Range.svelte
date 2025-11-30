<script lang="ts">
  let {
    label,
    value = $bindable(),
    min,
    max,
    step,
    displayFormat = (v: number) => v.toString()
  } = $props<{
    label: string
    value: number
    min: number
    max: number
    step: number
    displayFormat?: (val: number) => string
  }>()
</script>

<div class="space-y-3">
  <div class="flex justify-between text-xs text-[#a1a1aa] select-none">
    <span class="font-medium">{label}</span>
    <span class="font-mono text-[#818cf8] bg-[#818cf8]/10 px-1.5 py-0.5 rounded text-[10px]"
      >{displayFormat(value)}</span
    >
  </div>
  <div class="relative flex items-center group">
    <input
      type="range"
      {min}
      {max}
      {step}
      bind:value
      class="w-full h-1.5 bg-[#2e3245] rounded-full appearance-none cursor-pointer accent-[#818cf8] hover:accent-[#6366f1] transition-all focus:outline-none focus:ring-2 focus:ring-[#818cf8]/30"
    />
  </div>
</div>
