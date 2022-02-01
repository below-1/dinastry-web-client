<script>
	import { onMount } from 'svelte';
	import { zip } from 'lodash';
  import JoButton from 'dinastry/components/commons/JoButton.svelte';
  import JoAsyncContent from 'dinastry/components/commons/JoAsyncContent.svelte';
  import 'dinastry/styles/jo-table.css';

  const ratios = [0.1, 0.2, 0.3];
  const n_run = 10;
  let test_results = [];
  let id = 0;

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
  	console.log(test_results);
  })
</script>

<style>
	table.jo-table.spec {
		border-collapse: collapse;
	}

  table.jo-table.spec tbody tr:nth-child(even) {
    background: rgb(250, 250, 250);
  }

  table.jo-table.spec > thead {
    background: #444;
    color: white;
    font-weight: bold;
  }

  table.jo-table.spec > thead th {
    border: 1px solid #ddd;
  }
</style>

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

<div class="w-full my-6 px-12">
  <table class="jo-table my-6">
    <thead>
      <tr>
      	<!-- empty here -->
      	<th class="text-center">NO</th>
      	<th class="text-center">tp</th>
        <th class="text-center">fp</th>
        <th class="text-center">tn</th>
        <th class="text-center">fn</th>
        <th class="text-center">acc</th>
        <th class="text-center">prec</th>
        <th class="text-center">rec</th>
        <th class="text-center">f1</th>
      </tr>
    </thead>
    <tbody>
      {#each test_results as packed, i (i)}
        <tr class="text-xs">
          <td class="text-center">{i + 1}</td>
          <td class="text-center">{packed[id].tp}</td>
          <td class="text-center">{packed[id].fp}</td>
          <td class="text-center">{packed[id].tn}</td>
          <td class="text-center">{packed[id].fn}</td>
          <td class="text-center">{packed[id].acc.toFixed(3)}</td>
          <td class="text-center">{packed[id].prec.toFixed(3)}</td>
          <td class="text-center">{packed[id].recall.toFixed(3)}</td>
          <td class="text-center">{packed[id].f1.toFixed(3)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
