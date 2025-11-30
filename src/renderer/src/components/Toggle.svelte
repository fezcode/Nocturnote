<script lang="ts">
  let { label, checked = $bindable() } = $props<{
    label: string
    checked: boolean
  }>()
</script>

<label class="flex items-center justify-between cursor-pointer group py-1">
  <span
    class="text-sm text-[#d4d4d8] group-hover:text-white transition-colors select-none font-medium"
    >{label}</span
  >
  <div class="relative">
    <input type="checkbox" bind:checked class="sr-only peer" />
    <div
      class="w-11 h-6 bg-[#2e3245] rounded-full peer peer-checked:bg-[#818cf8] transition-all duration-300 ease-out shadow-inner border border-transparent peer-checked:border-[#818cf8]/50"
    ></div>
    <div
      class="absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] peer-checked:translate-x-5 shadow-sm"
    ></div>
  </div>
</label>
