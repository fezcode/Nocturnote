<script lang="ts">
  import type { AppSettings } from '../types'
  import { tick } from 'svelte'
  import { Bold, Italic, Heading } from 'lucide-svelte'
  import { fade, scale } from 'svelte/transition'

  let {
    content = $bindable(),
    settings,
    notepadMode,
    markdownMode = false,
    markdownHTML = '',
    lineHeights,
    lineNumWidth,
    lineHeightPx,
    baselineOffset,
    highlightedHTML,
    showSearch,
    activeMatchIndex,
    textAreaRef = $bindable(),
    lineNumRef = $bindable(),
    highlightRef = $bindable(),
    measureRef = $bindable(),
    handleScroll,
    handleInput,
    textLines,
    onEditorClick
  } = $props<{
    content: string
    settings: AppSettings
    notepadMode: boolean
    markdownMode?: boolean
    markdownHTML?: string
    lineHeights: number[]
    lineNumWidth: number
    lineHeightPx: number
    baselineOffset: number
    highlightedHTML: string
    showSearch: boolean
    activeMatchIndex: number
    textAreaRef: HTMLTextAreaElement
    lineNumRef: HTMLDivElement
    highlightRef: HTMLDivElement
    measureRef: HTMLDivElement
    handleScroll: () => void
    handleInput: (e: Event) => void
    textLines: string[]
    onEditorClick: () => void
  }>()

  let containerRef: HTMLElement
  let isResizing = $state(false)
  let splitRatio = $state(50)
  let editorWidth = $state(0)
  let previewRef = $state<HTMLDivElement>()
  let isSyncingScroll = false

  // REACTIVE WIDTH TRACKING:
  // Uses ResizeObserver to track the exact width of the textarea.
  // This width is passed to the hidden measurement div (measureRef) to ensure
  // line wrapping matches exactly, preventing alignment issues.
  $effect(() => {
    if (!textAreaRef) return
    editorWidth = textAreaRef.clientWidth
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        editorWidth = entry.contentRect.width
        calculateLineHeights()
      }
    })
    observer.observe(textAreaRef)
    return () => observer.disconnect()
  })

  // Formatting Toolbar State
  let showToolbar = $state(false)
  let toolbarPos = $state({ x: 0, y: 0 })
  let isFormatting = false

  function startResize() {
    isResizing = true
    window.addEventListener('mousemove', handleResize)
    window.addEventListener('mouseup', stopResize)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  function stopResize() {
    isResizing = false
    window.removeEventListener('mousemove', handleResize)
    window.removeEventListener('mouseup', stopResize)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  function handleResize(e: MouseEvent) {
    if (!isResizing || !containerRef) return
    const rect = containerRef.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const newRatio = (offsetX / rect.width) * 100
    splitRatio = Math.max(20, Math.min(80, newRatio))
  }

  function resetResize() {
    splitRatio = 50
  }

  // SYNC SCROLL LOGIC
  // Synchronizes scrolling between the editor and preview pane based on line counts.
  // This provides a more accurate text-to-text alignment than percentage-based scrolling.
  // Uses `isSyncingScroll` flag to prevent infinite scroll event loops.

  function syncScrollToPreview() {
    if (!settings.syncScroll || !markdownMode || !textAreaRef || !previewRef || isSyncingScroll)
      return

    isSyncingScroll = true
    
    // LINE-BASED SYNC (Editor -> Preview)
    // 1. Calculate the ratio of lines scrolled in the editor.
    // 2. Apply this ratio to the total scrollable height of the preview pane.
    const totalLines = textLines.length || 1
    const currentLineIndex = Math.floor((textAreaRef.scrollTop / (textAreaRef.scrollHeight - textAreaRef.clientHeight)) * totalLines)
    
    // Preview scroll calculation:
    // (Current Line / Total Lines) * (Preview Total Scroll Height)
    const previewScrollTop = (currentLineIndex / totalLines) * (previewRef.scrollHeight - previewRef.clientHeight)
    
    previewRef.scrollTop = previewScrollTop

    setTimeout(() => (isSyncingScroll = false), 10)
  }

  function handlePreviewScroll() {
    if (!settings.syncScroll || !markdownMode || !textAreaRef || !previewRef || isSyncingScroll)
      return

    isSyncingScroll = true

    // LINE-BASED SYNC (Preview -> Editor)
    // 1. Calculate the scroll percentage of the preview pane.
    // 2. Map this percentage back to the editor's scroll height.
    const previewPercent = previewRef.scrollTop / (previewRef.scrollHeight - previewRef.clientHeight || 1)
    textAreaRef.scrollTop = previewPercent * (textAreaRef.scrollHeight - textAreaRef.clientHeight)

    setTimeout(() => (isSyncingScroll = false), 10)
  }

  async function applyFormat(type: 'bold' | 'italic' | 'heading') {
    if (!textAreaRef || isFormatting) return
    isFormatting = true

    try {
      textAreaRef.focus() // Ensure focus for execCommand
      const start = textAreaRef.selectionStart
      const end = textAreaRef.selectionEnd

      const selectedText = content.substring(start, end)
      let newText = ''

      if (type === 'heading') {
        newText = `# ${selectedText}`
      } else {
        const marker = type === 'bold' ? '**' : '_'
        newText = marker + selectedText + marker
      }

      // UNDO HISTORY FIX:
      // Instead of directly mutating `content`, use execCommand.
      // This preserves the browser's built-in undo/redo stack.
      // It also triggers the `input` event, which will naturally update `content`.
      const success = document.execCommand('insertText', false, newText)

      // Fallback for environments where execCommand might fail (rare for simple textareas)
      if (!success) {
        content = content.substring(0, start) + newText + content.substring(end)
        await tick()
        handleInput({ target: textAreaRef } as unknown as Event)
      }

      // If success (or fallback), we need to adjust selection
      // We want to select the newly inserted text (including markers)
      await tick() // wait for input event to process state
      if (textAreaRef) {
        textAreaRef.setSelectionRange(start, start + newText.length)
      }
    } finally {
      isFormatting = false
      showToolbar = false
    }
  }

  function handleTextareaKeydown(e: KeyboardEvent) {
    const ctrl = e.ctrlKey || e.metaKey
    const key = e.key.toLowerCase()

    if (key === 'tab') {
      e.preventDefault()
      const success = document.execCommand('insertText', false, '\t')
      if (!success && textAreaRef) {
        const start = textAreaRef.selectionStart
        const end = textAreaRef.selectionEnd
        content = content.substring(0, start) + '\t' + content.substring(end)
        tick().then(() => {
          handleInput({ target: textAreaRef } as unknown as Event)
          if (textAreaRef) {
            textAreaRef.selectionStart = textAreaRef.selectionEnd = start + 1
          }
        })
      }
      return
    }

    if (ctrl) {
      if (key === 'b') {
        e.preventDefault()
        applyFormat('bold')
      } else if (key === 'i') {
        e.preventDefault()
        applyFormat('italic')
      }
    }
  }

  function handleMouseUp(e: MouseEvent) {
    // Capture coordinates immediately to avoid event staleness issues
    const { clientX, clientY } = e

    // Use setTimeout to ensure selection state is updated after the event
    setTimeout(() => {
      if (!textAreaRef) return
      const start = textAreaRef.selectionStart
      const end = textAreaRef.selectionEnd

      if (start !== end) {
        showToolbar = true
        // Position relative to viewport, shifted below
        toolbarPos = { x: clientX, y: clientY + 15 }
      } else {
        showToolbar = false
      }
    }, 0)
  }

  function handleKeyUp(e: KeyboardEvent) {
    // Hide toolbar if selection is cleared via keyboard
    if (!textAreaRef) return
    const start = textAreaRef.selectionStart
    const end = textAreaRef.selectionEnd
    if (start === end) {
      showToolbar = false
    }
  }

  function handleEditorScrollWrapper() {
    handleScroll()
    syncScrollToPreview()
  }

  function handleTextAreaClick() {
    onEditorClick()
  }
</script>

<main bind:this={containerRef} class="relative flex-1 z-10 flex overflow-hidden">
  <!-- MEASUREMENT DIV:
       1. Position fixed & pointer-events none: Removes it from flow to prevent extending scroll height.
       2. Uses `editorWidth`: Ensures wrapped lines match the visible textarea exactly. -->
  <div
    bind:this={measureRef}
    aria-hidden="true"
    class="antialiased"
    style="visibility: hidden; position: fixed; top: 0; left: 0; z-index: -1000; pointer-events: none; width: {editorWidth}px; font-size: {settings.fontSize}px; font-family: {settings.fontFamily}; font-weight: {settings.fontWeight}; line-height: {lineHeightPx}px; white-space: {settings.wordWrap
      ? 'pre-wrap'
      : 'pre'}; word-break: break-word; padding-left: 16px; padding-right: 32px; box-sizing: border-box; text-rendering: optimizeLegibility;"
  >
    {#if settings.wordWrap}
      {#each textLines as line}
        <div style="min-height: {lineHeightPx}px;">{line || ' '}</div>
      {/each}
    {/if}
  </div>

  <!-- Editor Pane -->
  <div
    class="flex h-full min-w-0 overflow-hidden relative"
    style="width: {markdownMode ? splitRatio + '%' : '100%'}"
  >
    {#if settings.showLineNumbers}
      <div
        bind:this={lineNumRef}
        class="h-full select-none pr-3 text-right overflow-hidden transition-all duration-300 shrink-0"
        style="width: {lineNumWidth}px; font-size: {settings.fontSize}px; font-family: {settings.fontFamily}; font-weight: {settings.fontWeight}; line-height: {lineHeightPx}px; color: {notepadMode
          ? '#9ca3af'
          : '#52525b'}; background-color: {notepadMode
          ? 'transparent'
          : 'rgba(0,0,0,0.2)'}; border-right: {notepadMode
          ? '2px solid #e0e0e0'
          : '1px solid #2e3245'}; padding-top: 8px;"
      >
        {#each lineHeights as height, i}
          <div style="height: {height}px;">{i + 1}</div>
        {/each}
        <div style="height: 32px;"></div>
      </div>
    {/if}

    <div class="flex-1 relative h-full min-w-0">
      <!-- HIGHLIGHT LAYER:
           Padding right includes `2rem` (standard padding) + `10px` (scrollbar width)
           to ensure highlights align perfectly with the text in the scrollable textarea below. -->
      <div
        bind:this={highlightRef}
        class="absolute inset-0 z-0 pointer-events-none overflow-hidden pt-2 pb-8 pl-4 antialiased"
        style="padding-right: calc(2rem + 10px); font-size: {settings.fontSize}px; font-family: {settings.fontFamily}; font-weight: {settings.fontWeight}; line-height: {lineHeightPx}px; white-space: {settings.wordWrap
          ? 'pre-wrap'
          : 'pre'}; word-break: break-word; color: transparent;"
      >
        {@html highlightedHTML}
      </div>
      <!-- EDITOR TEXTAREA:
           overflow-y: scroll ensures vertical scrollbar is always visible (if needed),
           preventing layout shifts that would misalign the highlight layer. -->
      <textarea
        bind:this={textAreaRef}
        onscroll={handleEditorScrollWrapper}
        onclick={handleTextAreaClick}
        onkeydown={handleTextareaKeydown}
        onkeyup={handleKeyUp}
        onmouseup={handleMouseUp}
        value={content}
        oninput={handleInput}
        spellcheck="false"
        style="
                    overflow-y: scroll;
                    font-size: {settings.fontSize}px;
                    font-family: {settings.fontFamily};
                    font-weight: {settings.fontWeight};
                    line-height: {lineHeightPx}px;
                    white-space: {settings.wordWrap ? 'pre-wrap' : 'pre'};
                    background-image: {notepadMode
          ? 'linear-gradient(transparent calc(100% - 1px), #cbd5e1 calc(100% - 1px))'
          : 'none'};
                    background-size: {notepadMode ? '100% ' + lineHeightPx + 'px' : 'auto'};
                    background-position: {notepadMode ? '0 ' + baselineOffset + 'px' : '0 0'};
                    background-attachment: local;
                "
        class="absolute inset-0 w-full h-full resize-none bg-transparent pt-2 pb-8 pr-8 pl-4 focus:outline-none leading-relaxed relative z-10 {notepadMode
          ? 'placeholder-gray-400 caret-black'
          : 'placeholder-white/10 caret-[#818cf8]'}"
        placeholder="Type something amazing..."
      ></textarea>
    </div>
  </div>

  {#if markdownMode}
    <!-- Resizer -->
    <div
      class="w-3 hover:cursor-col-resize cursor-col-resize shrink-0 z-50 flex items-center justify-center"
      onmousedown={startResize}
      ondblclick={resetResize}
      role="separator"
      aria-label="Resize split view"
    >
      <div
        class="h-full border-l-2 border-dotted {notepadMode
          ? 'border-gray-300'
          : 'border-gray-700'}"
      ></div>
    </div>

    <!-- Markdown Preview Pane -->
    <div
      bind:this={previewRef}
      onscroll={handlePreviewScroll}
      class="flex-1 h-full min-w-0 overflow-y-auto p-8 prose {notepadMode
        ? 'prose-slate'
        : 'prose-invert'} max-w-none break-words font-mono"
    >
      {@html markdownHTML}
    </div>
  {/if}

  <!-- Floating Formatting Toolbar -->
  {#if showToolbar}
    <div
      class="fixed z-[200]"
      style="top: {toolbarPos.y}px; left: {toolbarPos.x}px; transform: translateX(-50%);"
    >
      <div
        transition:scale={{ duration: 150, start: 0.95 }}
        class="flex items-center gap-1 p-1.5 rounded-lg shadow-xl border {notepadMode
          ? 'bg-white border-gray-200'
          : 'bg-[#18181b] border-[#2e3245]'}"
      >
        <button
          onmousedown={(e) => {
            e.preventDefault()
            applyFormat('bold')
          }}
          class="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 {notepadMode
            ? 'text-gray-700'
            : 'text-gray-300'} transition-colors"
          title="Bold (Ctrl+B)"
        >
          <Bold size="16" strokeWidth={2.5} />
        </button>
        <button
          onmousedown={(e) => {
            e.preventDefault()
            applyFormat('italic')
          }}
          class="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 {notepadMode
            ? 'text-gray-700'
            : 'text-gray-300'} transition-colors"
          title="Italic (Ctrl+I)"
        >
          <Italic size="16" strokeWidth={2.5} />
        </button>
        <button
          onmousedown={(e) => {
            e.preventDefault()
            applyFormat('heading')
          }}
          class="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 {notepadMode
            ? 'text-gray-700'
            : 'text-gray-300'} transition-colors"
          title="Heading"
        >
          <Heading size="16" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  {/if}
</main>

<style>
  textarea::-webkit-scrollbar {
    width: 10px;
  }
  textarea::-webkit-scrollbar-track {
    background: transparent;
  }
  textarea::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
  textarea::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid transparent;
    background-clip: content-box;
  }

  /* Search Highlighting */
  :global(.highlight-match) {
    background-color: rgba(251, 191, 36, 0.2);
    color: transparent;
    border-radius: 2px;
  }
  :global(.highlight-active) {
    background-color: #f97316;
    color: transparent;
    border-radius: 2px;
    outline: 1px solid rgba(255, 255, 255, 0.3);
  }

  /* Enhanced Markdown Styling */
  :global(.prose) {
    font-family: 'ui-monospace', 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
    line-height: 1.6;
  }
  :global(.prose)::-webkit-scrollbar {
    width: 10px;
  }
  :global(.prose)::-webkit-scrollbar-track {
    background: transparent;
  }
  :global(.prose)::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
  :global(.prose)::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid transparent;
    background-clip: content-box;
  }
  :global(.prose h1) {
    font-size: 2.25em;
    font-weight: 800;
    margin-top: 0;
    margin-bottom: 0.8em;
    letter-spacing: -0.025em;
    line-height: 1.1;
  }
  :global(.prose h2) {
    font-size: 1.75em;
    font-weight: 700;
    margin-top: 1.5em;
    margin-bottom: 0.6em;
    letter-spacing: -0.025em;
    line-height: 1.2;
    border-bottom: 1px solid rgba(128, 128, 128, 0.2);
    padding-bottom: 0.3em;
  }
  :global(.prose h3) {
    font-size: 1.375em;
    font-weight: 600;
    margin-top: 1.4em;
    margin-bottom: 0.6em;
    line-height: 1.4;
  }
  :global(.prose h4) {
    font-size: 1.125em;
    font-weight: 600;
    margin-top: 1.2em;
    margin-bottom: 0.5em;
  }

  :global(.prose p) {
    margin-bottom: 1.25em;
  }
  :global(.prose ul) {
    list-style-type: disc;
    padding-left: 1.625em;
    margin-bottom: 1.25em;
  }
  :global(.prose ol) {
    list-style-type: decimal;
    padding-left: 1.625em;
    margin-bottom: 1.25em;
  }
  :global(.prose li) {
    margin-bottom: 0.375em;
  }

  :global(.prose blockquote) {
    border-left: 4px solid rgba(128, 128, 128, 0.4);
    padding-left: 1.25em;
    margin-bottom: 1.25em;
    font-style: italic;
    opacity: 0.8;
  }

  :global(.prose pre) {
    background-color: rgba(0, 0, 0, 0.2);
    padding: 1em;
    border-radius: 0.5em;
    overflow-x: auto;
    margin-bottom: 1.5em;
    border: 1px solid rgba(128, 128, 128, 0.1);
  }
  :global(.bg-\[#fdfbf7\] .prose pre) {
    background-color: rgba(0, 0, 0, 0.05);
  }

  :global(.prose code) {
    font-family: 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', monospace;
    font-size: 0.875em;
    background-color: rgba(128, 128, 128, 0.15);
    padding: 0.2em 0.4em;
    border-radius: 0.25em;
  }
  :global(.prose pre code) {
    background-color: transparent;
    padding: 0;
    color: inherit;
  }

  :global(.prose a) {
    color: #6366f1;
    text-decoration: none;
    font-weight: 500;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
    /* Prevent links from being clickable in preview to avoid unloading the app */
    pointer-events: none;
  }
  :global(.prose a:hover) {
    border-bottom-color: #6366f1;
  }

  :global(.prose img) {
    max-width: 100%;
    height: auto;
    border-radius: 0.5em;
    margin: 1.5em 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  :global(.prose hr) {
    border: 0;
    border-top: 1px solid rgba(128, 128, 128, 0.2);
    margin: 2em 0;
  }

  :global(.prose table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.5em;
  }
  :global(.prose th) {
    text-align: left;
    font-weight: 600;
    padding: 0.75em;
    border-bottom: 2px solid rgba(128, 128, 128, 0.2);
  }
  :global(.prose td) {
    padding: 0.75em;
    border-bottom: 1px solid rgba(128, 128, 128, 0.1);
  }
</style>
