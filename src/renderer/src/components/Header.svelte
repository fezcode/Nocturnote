<script lang="ts">
  import { 
    Search, 
    FileText, 
    CloudRain, 
    Settings, 
    FilePlus, 
    FolderOpen, 
    Save, 
    Minus, 
    Square, 
    X,
    Info
  } from 'lucide-svelte';

  let { 
    notepadMode = $bindable(), 
    rainMode = $bindable(), 
    showSettings = $bindable(), 
    showSearch = $bindable(),
    showAbout = $bindable(),
    isSaved, 
    fileName, 
    isMacOrLinux,
    winClose,
    winMin,
    winMax,
    toggleSearch,
    handleNew,
    handleOpen,
    handleSave,
    confirmAction
  } = $props<{
    notepadMode: boolean;
    rainMode: boolean;
    showSettings: boolean;
    showSearch: boolean;
    showAbout: boolean;
    isSaved: boolean;
    fileName: string;
    isMacOrLinux: boolean;
    winClose: () => void;
    winMin: () => void;
    winMax: () => void;
    toggleSearch: () => void;
    handleNew: () => void;
    handleOpen: () => void;
    handleSave: () => void;
    confirmAction: (fn: () => void) => void;
  }>();
</script>

<header class="h-12 flex items-center justify-between px-4 draggable-region z-50 border-b transition-colors duration-500 relative backdrop-blur-md shrink-0 {notepadMode ? 'bg-[#fdfbf7]/80 border-gray-300' : 'bg-[#0e1019]/80 border-[#2e3245]'}">
  <div class="flex items-center gap-4">
    {#if isMacOrLinux}
      <div class="flex items-center gap-2 no-drag group">
        <button onclick={winClose} class="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-75 transition-all"></button>
        <button onclick={winMin} class="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-75 transition-all"></button>
        <button onclick={winMax} class="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-75 transition-all"></button>
      </div>
    {/if}
    <div class="flex items-center gap-2 transition-opacity {notepadMode ? 'opacity-80' : 'opacity-60'} hover:opacity-100">
      <div class="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentcolor] {isSaved ? 'text-emerald-400 bg-emerald-400' : 'text-amber-400 bg-amber-400'}"></div>
      <span class="text-xs font-medium tracking-wide {notepadMode ? 'text-gray-600' : 'text-gray-400'}">{fileName}</span>
    </div>
  </div>

  <div class="flex items-center gap-1">
     <button onclick={toggleSearch} title="Find (Ctrl+F)" class="p-2 rounded-lg transition-all active:scale-95 no-drag {showSearch ? 'text-[#fbbf24] bg-[#fbbf24]/10' : (notepadMode ? 'text-gray-400 hover:text-gray-800' : 'text-gray-500 hover:text-[#fbbf24] hover:bg-white/5')}">
       <Search size="18" strokeWidth={2} />
     </button>
     <div class="w-px h-4 mx-2 {notepadMode ? 'bg-gray-300' : 'bg-[#2e3245]'}"></div>
     <button onclick={() => notepadMode = !notepadMode} title="Notepad Mode" class="p-2 rounded-lg transition-all active:scale-95 no-drag {notepadMode ? 'text-gray-800 bg-gray-200' : 'text-gray-500 hover:text-[#818cf8]'}">
       <FileText size="18" strokeWidth={2} />
     </button>
     <button onclick={() => rainMode = !rainMode} title="Rain Mode" class="p-2 rounded-lg transition-all active:scale-95 no-drag {rainMode ? 'text-[#818cf8] bg-[#818cf8]/10' : (notepadMode ? 'text-gray-400' : 'text-gray-500 hover:text-[#818cf8]')}">
       <CloudRain size="18" strokeWidth={2} />
     </button>
     <div class="w-px h-4 mx-2 {notepadMode ? 'bg-gray-300' : 'bg-[#2e3245]'}"></div>
     <button onclick={() => showAbout = !showAbout} title="About" class="p-2 rounded-lg transition-all active:scale-95 no-drag {showAbout ? (notepadMode ? 'bg-gray-200' : 'bg-white/10') : (notepadMode ? 'text-gray-400' : 'text-gray-500 hover:text-[#818cf8]')}">
       <Info size="18" strokeWidth={2} />
     </button>
     <button onclick={() => showSettings = !showSettings} title="Settings" class="p-2 rounded-lg transition-all active:scale-95 no-drag {showSettings ? (notepadMode ? 'bg-gray-200' : 'bg-white/10') : (notepadMode ? 'text-gray-400' : 'text-gray-500 hover:text-[#818cf8]')}">
       <Settings size="18" strokeWidth={2} />
     </button>
     <div class="w-px h-4 mx-2 {notepadMode ? 'bg-gray-300' : 'bg-[#2e3245]'}"></div>
     <button onclick={() => confirmAction(handleNew)} title="New File" class="p-2 rounded-lg transition-all active:scale-95 no-drag {notepadMode ? 'text-gray-400 hover:text-gray-800' : 'text-gray-500 hover:text-[#818cf8]'}">
       <FilePlus size="18" strokeWidth={2} />
     </button>
     <button onclick={() => confirmAction(handleOpen)} title="Open" class="p-2 rounded-lg transition-all active:scale-95 no-drag {notepadMode ? 'text-gray-400 hover:text-gray-800' : 'text-gray-500 hover:text-[#818cf8]'}">
       <FolderOpen size="18" strokeWidth={2} />
     </button>
     <button onclick={handleSave} title="Save" class="p-2 rounded-lg transition-all active:scale-95 no-drag {notepadMode ? 'text-gray-400 hover:text-gray-800' : 'text-gray-500 hover:text-[#818cf8]'}">
       <Save size="18" strokeWidth={2} />
     </button>
     {#if !isMacOrLinux}
      <div class="ml-2 flex h-full">
          <button onclick={winMin} class="h-8 w-10 flex items-center justify-center no-drag {notepadMode ? 'hover:bg-gray-200 text-gray-500' : 'hover:bg-white/10 text-white'}">
            <Minus size="10" strokeWidth={4} />
          </button>
          <button onclick={winMax} class="h-8 w-10 flex items-center justify-center no-drag {notepadMode ? 'hover:bg-gray-200 text-gray-500' : 'hover:bg-white/10 text-white'}">
            <Square size="10" strokeWidth={2} />
          </button>
          <button onclick={winClose} class="h-8 w-10 flex items-center justify-center no-drag hover:bg-red-500 hover:text-white {notepadMode ? 'text-gray-500' : 'text-white'}">
            <X size="14" strokeWidth={2} />
          </button>
      </div>
     {/if}
  </div>
</header>

<style>
  .draggable-region { -webkit-app-region: drag; }
  .no-drag { -webkit-app-region: no-drag; }
</style>