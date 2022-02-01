<script>
  import { onMount } from 'svelte';
  import JoButton from 'dinastry/components/commons/JoButton.svelte';
  import JoAsyncContent from 'dinastry/components/commons/JoAsyncContent.svelte';
  import create_row_converter from 'dinastry/services/row_converter';
  import all_criteria from 'dinastry/services/all_criteria';
  import get_nb_summary from 'dinastry/services/nb_summary';
  import { create_predictor } from 'dinastry/services/predict';
  import testing from 'dinastry/services/testing.js';
  import axios from 'dinastry/services/axios.js';
  import 'dinastry/styles/jo-table.css';

  const ratios = [0.1, 0.2, 0.3];
  let id = 1;
  let result = [];
  let acc = 0;
  let prec = 0;
  let recall = 0;
  let f1 = 0;

  let tp = 1;
  let fp;
  let tn;
  let fn;

  function build_conf_width ({ tp, fp, tn, fn, result }) {
    const n = result.length;
    if (n == 0) return {
      tp: 0,
      fp: 0,
      tn: 0,
      fn: 0
    };
    return {
      tp: ((tp / result.length) * 100).toFixed(0),
      fp: ((fp / result.length) * 100).toFixed(0),
      tn: ((tn / result.length) * 100).toFixed(0),
      fn: ((fn / result.length) * 100).toFixed(0)
    }
  }

  $: conf_width = build_conf_width({ tp, fp, tn, fn, result });
  $: accuracy = result.filter(r => r.hit).length * 1.0 / result.length;

  function loadData (id) {
    if (!id) return;
    const items = JSON.parse(localStorage.getItem('dinastry.test_results'));
    const item = items[id - 1];
    tp = item.tp;
    tn = item.tn;
    fp = item.fp;
    fn = item.fn;
    acc  = item.acc;
    prec = item.prec;
    f1 = item.f1;
    recall = item.recall;
    result = item.result;
  }

  $: loadData(id);
</script>

<div>

  <div class="w-full bg-blue-800 text-white flex items-center justify-start px-12 h-20">
    <div class="font-bold text-2xl">Hasil Pengujian {id}</div>
    <div class="flex-grow"></div>
    <div class="flex items-center">
      {#each ratios as r, i (i)}
        <button 
          on:click={() => {
            id = i + 1;
          }}
          class="font-black px-8 text-lg">{(r * 100).toFixed(0)}%</button>
      {/each}
    </div>
  </div>

  <div class="w-full px-12 py-4 border-b border-gray-300">
    <div class="flex items-center mb-2 font-bold">
      <div class="w-32">Akurasi</div>
      <div class="flex-grow">
        <div class="h-6 bg-green-600" style={`width: ${acc.toFixed(0)}%;`}>
        </div>
      </div>
      <div class="ml-3">{acc.toFixed(2)} %</div>
    </div>
    <div class="flex items-center mb-2 font-bold">
      <div class="w-32">Precision</div>
      <div class="flex-grow">
        <div class="h-6 bg-green-600" style={`width: ${prec.toFixed(0)}%;`}>
        </div>
      </div>
      <div class="ml-3">{prec.toFixed(2)} %</div>
    </div>
    <div class="flex items-center mb-2 font-bold">
      <div class="w-32">Recall</div>
      <div class="flex-grow">
        <div class="h-6 bg-green-600" style={`width: ${recall.toFixed(0)}%;`}>
        </div>
      </div>
      <div class="ml-3">{recall.toFixed(2)} %</div>
    </div>
    <div class="flex items-center mb-2 font-bold">
      <div class="w-32">F1 Measure</div>
      <div class="flex-grow">
        <div class="h-6 bg-green-600" style={`width: ${f1.toFixed(0)}%;`}>
        </div>
      </div>
      <div class="ml-3">{f1.toFixed(2)} %</div>
    </div>
  </div>

  <div class="w-2/3 px-12 py-4 border-b border-gray-300">

    <div class="grid grid-cols-3 gap-3 font-bold">

      <div></div>
      <div>Layak</div>
      <div>Tidak Layak</div>

      <div>Layak</div>
      <div>{tp}</div>
      <div>{fn}</div>

      <div>Tidak Layak</div>
      <div>{fp}</div>
      <div>{tn}</div>

    </div>
  </div>

  <div class="w-full my-6 px-12">
    <div class="font-semibold text-lg">Akurasi: {(acc).toFixed(2)} %</div>
    <table class="jo-table my-6">
      <thead>
        <tr>
          <th>Nama</th>
          <th>Aktual</th>
          <th>Sistem</th>
        </tr>
      </thead>
      <tbody>
        {#each result as row (row._id)}
          <tr class="text-xs">
            <td>{row.nama}</td>
            <td>{row.actual_label}</td>
            <td>{row.result_label}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

</div>
