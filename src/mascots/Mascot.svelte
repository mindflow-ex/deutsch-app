<script>
  // Маскот в SVG: id — кто, emotion — neutral | happy | sad | think | cheer.
  let { id = 'shiba', emotion = 'neutral', size = 120, say = '' } = $props();
  const uid = Math.random().toString(36).slice(2, 7);
</script>

<div class="wrap" style="--s:{size}px">
  <svg viewBox="0 0 120 120" width={size} height={size} class="m {id} {emotion}" aria-label={id} role="img">
    <ellipse cx="60" cy="114" rx="30" ry="4" fill="#000" opacity=".08" />
    <g class="body">
      {#if id === 'deer'}
        <ellipse cx="34" cy="40" rx="9" ry="17" fill="#b47e48" transform="rotate(-30 34 40)" class="ear l" />
        <ellipse cx="86" cy="40" rx="9" ry="17" fill="#b47e48" transform="rotate(30 86 40)" class="ear r" />
        <ellipse cx="34" cy="41" rx="4" ry="10" fill="#f1c9a5" transform="rotate(-30 34 41)" />
        <ellipse cx="86" cy="41" rx="4" ry="10" fill="#f1c9a5" transform="rotate(30 86 41)" />
        <ellipse cx="60" cy="66" rx="36" ry="38" fill="#c8935a" />
        <ellipse cx="60" cy="84" rx="18" ry="14" fill="#f3dcc2" />
        <circle cx="40" cy="50" r="2.5" fill="#f3dcc2" /><circle cx="78" cy="46" r="2" fill="#f3dcc2" /><circle cx="84" cy="56" r="2.5" fill="#f3dcc2" />
        <ellipse cx="60" cy="79" rx="5" ry="3.5" fill="#3b2a20" />
      {:else if id === 'cloud'}
        {#if emotion === 'cheer'}
          <g class="rainbow" fill="none" stroke-width="5" stroke-linecap="round">
            <path d="M14 70a46 46 0 0 1 92 0" stroke="#e8605a" />
            <path d="M20 70a40 40 0 0 1 80 0" stroke="#f2c14e" />
            <path d="M26 70a34 34 0 0 1 68 0" stroke="#6cbf72" />
            <path d="M32 70a28 28 0 0 1 56 0" stroke="#5b9bd5" />
          </g>
        {/if}
        <g class="puff">
          <circle cx="38" cy="66" r="22" /><circle cx="60" cy="54" r="26" /><circle cx="84" cy="66" r="22" />
          <rect x="24" y="64" width="72" height="30" rx="15" />
        </g>
      {:else if id === 'fox'}
        <path class="tail" d="M88 92 q30 -6 24 -34 q-10 14 -28 22z" fill="#e07b39" />
        <path class="tail" d="M108 62 q-4 -6 4 -6 q2 6 -4 6z" fill="#fff6ec" />
        <path d="M28 46 L34 14 L52 36z" fill="#e07b39" /><path d="M92 46 L86 14 L68 36z" fill="#e07b39" />
        <path d="M33 38 L36 22 L46 35z" fill="#3b2a20" /><path d="M87 38 L84 22 L74 35z" fill="#3b2a20" />
        <ellipse cx="60" cy="64" rx="36" ry="34" fill="#e07b39" />
        <path d="M26 66 Q60 116 94 66 Q78 86 60 86 Q42 86 26 66z" fill="#fff6ec" />
        <ellipse cx="60" cy="80" rx="4.5" ry="3.2" fill="#3b2a20" />
      {:else if id === 'monkey'}
        <circle cx="24" cy="62" r="13" fill="#9a6a43" /><circle cx="24" cy="62" r="7" fill="#e7c29b" />
        <circle cx="96" cy="62" r="13" fill="#9a6a43" /><circle cx="96" cy="62" r="7" fill="#e7c29b" />
        <circle cx="60" cy="62" r="36" fill="#9a6a43" />
        <path d="M30 64 Q30 40 50 44 Q60 50 70 44 Q90 40 90 64 Q92 96 60 96 Q28 96 30 64z" fill="#e7c29b" />
        <ellipse cx="56" cy="78" rx="1.6" ry="1.2" fill="#3b2a20" /><ellipse cx="64" cy="78" rx="1.6" ry="1.2" fill="#3b2a20" />
        {#if emotion === 'cheer' || emotion === 'happy'}
          <path class="banana" d="M92 26 q14 6 10 22 q-4 -12 -14 -16z" fill="#f2c14e" stroke="#c99a2a" stroke-width="1" />
        {/if}
      {:else if id === 'alpaca'}
        <ellipse cx="38" cy="30" rx="6" ry="12" fill="#e9dcc3" transform="rotate(-20 38 30)" />
        <ellipse cx="82" cy="30" rx="6" ry="12" fill="#e9dcc3" transform="rotate(20 82 30)" />
        <rect x="34" y="40" width="52" height="66" rx="26" fill="#f3ead8" />
        <g fill="#fffaf0">
          <circle cx="44" cy="34" r="10" /><circle cx="56" cy="28" r="11" /><circle cx="68" cy="28" r="11" /><circle cx="78" cy="35" r="10" /><circle cx="60" cy="38" r="10" />
        </g>
        <ellipse cx="60" cy="84" rx="15" ry="11" fill="#e2d2b4" />
        <path d="M57 81 q3 3 6 0" stroke="#5b4636" stroke-width="1.6" fill="none" />
        {#if emotion === 'happy'}<path class="grass" d="M70 92 l8 -8 M72 94 l10 -4" stroke="#6cbf72" stroke-width="2" stroke-linecap="round" />{/if}
      {:else}
        <path d="M30 50 L34 16 L56 38z" fill="#d9883e" /><path d="M90 50 L86 16 L64 38z" fill="#d9883e" />
        <path d="M35 42 L37 24 L49 37z" fill="#f6e3cc" /><path d="M85 42 L83 24 L71 37z" fill="#f6e3cc" />
        <ellipse cx="60" cy="66" rx="38" ry="34" fill="#d9883e" />
        <path d="M24 70 Q34 56 50 70 Q60 60 70 70 Q86 56 96 70 Q92 100 60 100 Q28 100 24 70z" fill="#f6e3cc" />
        <ellipse cx="44" cy="52" rx="5" ry="2.5" fill="#f6e3cc" /><ellipse cx="76" cy="52" rx="5" ry="2.5" fill="#f6e3cc" />
        <ellipse cx="60" cy="78" rx="5" ry="3.5" fill="#2b1f18" />
      {/if}

      <!-- лицо: общие глаза и рот -->
      <g class="face" transform={id === 'alpaca' ? 'translate(0 -2)' : id === 'cloud' ? 'translate(0 2)' : ''}>
        {#if emotion === 'happy' || emotion === 'cheer'}
          <path d="M40 62 q6 -7 12 0" stroke="#2b1f18" stroke-width="3" fill="none" stroke-linecap="round" />
          <path d="M68 62 q6 -7 12 0" stroke="#2b1f18" stroke-width="3" fill="none" stroke-linecap="round" />
        {:else if emotion === 'sad'}
          <path d="M40 54 l10 3" stroke="#2b1f18" stroke-width="2" stroke-linecap="round" />
          <path d="M80 54 l-10 3" stroke="#2b1f18" stroke-width="2" stroke-linecap="round" />
          <circle cx="46" cy="63" r="3.6" fill="#2b1f18" /><circle cx="74" cy="63" r="3.6" fill="#2b1f18" />
        {:else if emotion === 'think'}
          <path d="M40 54 q6 -4 12 0" stroke="#2b1f18" stroke-width="2" fill="none" stroke-linecap="round" />
          <circle cx="48" cy="61" r="4" fill="#2b1f18" /><circle cx="76" cy="61" r="4" fill="#2b1f18" />
          <circle cx="49.5" cy="59.5" r="1.3" fill="#fff" /><circle cx="77.5" cy="59.5" r="1.3" fill="#fff" />
        {:else}
          <circle cx="46" cy="61" r="4.5" fill="#2b1f18" class="eye" /><circle cx="74" cy="61" r="4.5" fill="#2b1f18" class="eye" />
          <circle cx="47.5" cy="59.5" r="1.5" fill="#fff" /><circle cx="75.5" cy="59.5" r="1.5" fill="#fff" />
        {/if}
        <ellipse cx="38" cy="72" rx="5" ry="3" fill="#ff8a8a" opacity=".45" />
        <ellipse cx="82" cy="72" rx="5" ry="3" fill="#ff8a8a" opacity=".45" />
        {#if id === 'cloud' || id === 'monkey'}
          {#if emotion === 'happy' || emotion === 'cheer'}
            <path d="M52 76 q8 9 16 0z" fill="#2b1f18" />
          {:else if emotion === 'sad'}
            <path d="M53 82 q7 -6 14 0" stroke="#2b1f18" stroke-width="2.4" fill="none" stroke-linecap="round" />
          {:else if emotion === 'think'}
            <path d="M54 80 h10" stroke="#2b1f18" stroke-width="2.4" stroke-linecap="round" />
          {:else}
            <path d="M54 78 q6 5 12 0" stroke="#2b1f18" stroke-width="2.4" fill="none" stroke-linecap="round" />
          {/if}
        {:else if id !== 'alpaca'}
          {#if emotion === 'happy' || emotion === 'cheer'}
            <path d="M52 84 q4 7 8 2 q4 5 8 -2" stroke="#2b1f18" stroke-width="2.2" fill="#ff8f8f" stroke-linecap="round" />
          {:else if emotion === 'sad'}
            <path d="M54 90 q6 -5 12 0" stroke="#2b1f18" stroke-width="2.2" fill="none" stroke-linecap="round" />
          {:else}
            <path d="M54 85 q3 3 6 0 q3 3 6 0" stroke="#2b1f18" stroke-width="2" fill="none" stroke-linecap="round" />
          {/if}
        {/if}
        {#if emotion === 'think'}
          <g class="dots" fill="var(--ink-soft)"><circle cx="98" cy="30" r="3" /><circle cx="106" cy="20" r="4" /><circle cx="112" cy="8" r="5" /></g>
        {/if}
        {#if emotion === 'cheer' && id !== 'cloud'}
          <g class="sparks" fill="#f2c14e"><path d="M14 30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" /><path d="M104 40 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" /></g>
        {/if}
      </g>
    </g>
  </svg>
  {#if say}<div class="bubble">{say}</div>{/if}
</div>

<style>
  .wrap { display: flex; align-items: center; gap: 10px; }
  .m { flex: none; overflow: visible; }
  .bubble {
    background: var(--card); border: 2px solid var(--line); border-radius: 16px; padding: 10px 12px;
    font-size: 15px; line-height: 1.35; position: relative; box-shadow: var(--shadow);
  }
  .bubble::before { content: ''; position: absolute; left: -8px; top: 18px; border: 8px solid transparent; border-left: 0; border-right-color: var(--line); }
  .puff { fill: #f5f9ff; stroke: #cfe0f2; stroke-width: 2; transition: fill .4s; }
  .cloud.sad .puff { fill: #b9c4d2; animation: clear 1.6s ease forwards; }
  @keyframes clear { 60% { fill: #b9c4d2; } 100% { fill: #f5f9ff; } }
  .body { transform-origin: 60px 110px; animation: breathe 3.2s ease-in-out infinite; }
  .happy .body { animation: bounce .6s ease 2; }
  .cheer .body { animation: jump .8s ease 1; }
  .monkey.cheer .body { animation: flip .9s ease 1; }
  .sad .body { animation: slump .7s ease 1 forwards; }
  .fox.happy .tail, .fox.cheer .tail { transform-origin: 90px 90px; animation: wag .25s ease-in-out 6 alternate; }
  .deer.happy .body { animation: nod .5s ease 2; }
  .alpaca.happy .body, .alpaca.neutral .body { animation: chew 1.4s ease-in-out infinite; }
  .shiba.cheer .body { animation: jump .5s ease 2; }
  .eye { animation: blink 4.5s infinite; transform-box: fill-box; transform-origin: center; }
  .dots circle { animation: pop 1.4s infinite; }
  .dots circle:nth-child(2) { animation-delay: .2s; } .dots circle:nth-child(3) { animation-delay: .4s; }
  .rainbow { animation: fadein .6s ease; }
  @keyframes breathe { 50% { transform: scale(1.015, .985); } }
  @keyframes bounce { 30% { transform: translateY(-8px); } 60% { transform: translateY(0); } }
  @keyframes jump { 40% { transform: translateY(-16px) scale(1.04); } }
  @keyframes flip { 50% { transform: translateY(-18px) rotate(180deg); } 100% { transform: rotate(360deg); } }
  @keyframes slump { 50% { transform: translateX(-3px) rotate(-3deg); } 100% { transform: translateY(2px); } }
  @keyframes wag { from { transform: rotate(-10deg); } to { transform: rotate(12deg); } }
  @keyframes nod { 50% { transform: rotate(4deg) translateY(2px); } }
  @keyframes chew { 50% { transform: scaleY(.985) translateY(.5px); } }
  @keyframes blink { 0%, 94%, 100% { transform: scaleY(1); } 97% { transform: scaleY(.1); } }
  @keyframes pop { 50% { opacity: .3; } }
  @keyframes fadein { from { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .m * { animation: none !important; } }
</style>
