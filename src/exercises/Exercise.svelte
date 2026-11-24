<script>
  import Choice from './Choice.svelte';
  import Article from './Article.svelte';
  import Pairs from './Pairs.svelte';
  import Order from './Order.svelte';
  import Fill from './Fill.svelte';
  import Conjugation from './Conjugation.svelte';
  import Dictation from './Dictation.svelte';
  import ListenChoice from './ListenChoice.svelte';
  import Translate from './Translate.svelte';
  import Speak from './Speak.svelte';
  import MinimalPair from './MinimalPair.svelte';
  import Dialog from './Dialog.svelte';
  import Reading from './Reading.svelte';
  let { ex, done } = $props();
  const map = { choice: Choice, article: Article, pairs: Pairs, order: Order, fill: Fill, conjugation: Conjugation, dictation: Dictation, listen_choice: ListenChoice, translate: Translate, speak: Speak, minimal_pair: MinimalPair, dialog: Dialog, reading: Reading };
  const C = $derived(map[ex.type]);
</script>
{#if C}<C {ex} {done} />{:else}<p>Неизвестный тип задания: {ex.type}</p>{/if}
