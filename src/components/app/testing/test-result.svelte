<script>
	import { onMount } from 'svelte';
	import { zip } from 'lodash';
	import { push } from 'svelte-spa-router';

	let id = 0;
	const ratios = [0.1, 0.2, 0.3];
	let test_results = [];
	let summary = null;

	$: summary = calculateAverage({ test_results, id });

  function calculateAverage ({ test_results, id }) {
  	let results = {
  		tp: 0,
  		fp: 0,
  		tn: 0,
  		fn: 0,
  		acc: 0,
  		recall: 0,
  		prec: 0,
  		f1: 0
  	}
    if (id == 2) {
      console.log(results);
    }
  	test_results.forEach(packed => {
      if (id == 2) {
        console.log(packed[id]);
        console.log('----');
      }
  		results.tp += packed[id].tp;
  		results.fp += packed[id].fp;
  		results.tn += packed[id].tn;
  		results.fn += packed[id].fn;
  		results.acc += packed[id].acc;
  		results.recall += packed[id].recall;
  		results.prec += packed[id].prec;
  		results.f1 += packed[id].f1;
  	})
    // console.log(results);
  	const n = test_results.length;
  	// results.tp = results.tp / n;
  	// results.fp = results.fp / n;
  	// results.tn = results.tn / n;
  	// results.fn = results.fn / n;
  	results.acc = results.acc / n;
  	results.recall = results.recall / n;
  	results.prec = results.prec / n;
  	results.f1 = results.f1 / n;

  	return results;
  }

  onMount(() => {
  	const raw = localStorage.getItem('dinastry.test_results');
  	const results = JSON.parse(raw);
  	test_results = zip(...results);
  })
</script>

<div class="w-full bg-blue-800 text-white flex items-center justify-start px-12 h-20">
  <div class="font-bold text-2xl">Hasil Pengujian</div>
  <div class="flex-grow"></div>
  <div class="flex items-center">
    {#each ratios as r, i (i)}
      <button 
        on:click={() => {
          id = i;
        }}
        class="font-black px-8 text-lg"
        class:bg-blue-900={id == i}
       >{(100 - (r * 100)).toFixed(0)}%</button>
    {/each}
  </div>
</div>

<ul class="px-12">
	<li class="px-4 border-b border-gray-300 py-4 text-gray-700 font-bold text-xl">Akurasi: {summary.acc.toFixed(3)}</li>
	<li class="px-4 border-b border-gray-300 py-4 text-gray-700 font-bold text-xl">Precision: {summary.recall.toFixed(3)}</li>
	<li class="px-4 border-b border-gray-300 py-4 text-gray-700 font-bold text-xl">Recall: {summary.prec.toFixed(3)}</li>
	<li class="px-4 border-b border-gray-300 py-4 text-gray-700 font-bold text-xl">F1: {summary.f1.toFixed(3)}</li>
</ul>

<div class="px-16 py-4">
	<button
		on:click={() => {
			push('/app/test-detail');
		}}
    class="bg-teal-600 text-white text-xl font-bold px-4 py-2 rounded"
  >
    detail
  </button>
</div>
