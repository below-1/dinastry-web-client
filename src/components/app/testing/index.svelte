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

  let test_data = [];
  let data = [];
  let criteria = [];
  let row_converter;
  let predict;
  let networkStatus = 'ready';
  let errorMessage = '';
  let result = [];
  let acc = 0;
  let prec = 0;
  let recall = 0;
  let f1 = 0;

  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  $: conf_width = {
    tp: ((tp / result.length) * 100).toFixed(0),
    fp: ((fp / result.length) * 100).toFixed(0),
    tn: ((tn / result.length) * 100).toFixed(0),
    fn: ((fn / result.length) * 100).toFixed(0)
  };

  $: accuracy = result.filter(r => r.hit).length * 1.0 / result.length;

  function onChange(event) {
    let reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
  }

  function onReaderLoad(event){
    data = JSON.parse(event.target.result);
    data = data.map((d, index) => ({
      ...d,
      _id: index
    }))
  }

  async function runTesting () {
    networkStatus = 'loading';
    result = test_data.map(d => {
      const input = row_converter(d);
      const r = predict(input);
      console.log(r);

      if (d._class == 1 && r.cls == 1) {
        tp += 1;
      } else if (d._class == 0 && r.cls == 1) {
        fp += 1;
      } else if (d._class == 0 && r.cls == 0) {
        tn += 1;
      } else if (d._class == 1 && r.cls == 0) {
        fn += 1;
      }

      const test_r = {
        ...d,
        result_cls: r.cls,
        result_label: r.cls == 1 ? 'Layak' : 'Tidak Layak',
        actual_label: d._class == 1 ? 'Layak' : 'Tidak Layak',
        hit: r.cls == d._class
      };
      return test_r;
    })
    acc = ((tp + tn) / (result.length)) * 100;
    prec = (tp / (tp + fp)) * 100;
    recall = (tp / (tp + fn)) * 100;
    f1 = (2 * prec * recall) / (prec + recall);
    networkStatus = 'success';

    // const resp = await axios.get('/api/data', {
    //   params: {
    //     take: 1000
    //   }
    // });
    // const data = resp.data;
    // console.log(data.length);
    // testing({
    //   data,
    //   test_ratio: 0.3
    // });
  }

  onMount(async function () {
    networkStatus = 'loading';
    try {
      const resp = await axios.get('/api/nb/testing');

      test_data = resp.data.test_data;

      predict = create_predictor({ 
        ...resp.data.summary_result, 
        smooth: 1 
      });

      criteria = await all_criteria();
      row_converter = create_row_converter(criteria);
      networkStatus = 'ready';
    } catch (err) {
      networkStatus = 'error';
      errorMessage = 'gagal mengambil data';
      console.log(err);
    }
  })
</script>

<JoAsyncContent
  {networkStatus}
>
  <div slot="ready">
    <div class="w-full bg-blue-800 text-white flex items-center justify-center px-12 h-20">
      <div class="font-bold text-2xl">Form Pengujian</div>
    </div>
    <div class="w-full my-6 px-12">
      <div class="w-1/3 mx-auto my-12 shadow rounded p-8">

        <form class="my-2 flex flex-col">
          <!-- <JoButton cls="my-6" dark color="indigo" label="jalankan" action={runTesting}>
          </JoButton> -->

          <JoButton cls="my-6 text-lg font-bold p-4" dark color="indigo" label="jalankan" action={runTesting}>
          </JoButton>
        </form>
      </div>
    </div>
  </div>

  <div slot="success">

    <div class="w-full bg-blue-800 text-white flex items-center justify-center px-12 h-20">
      <div class="font-bold text-2xl">Hasil Pengujian</div>
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

    <div class="w-full px-12 py-4 border-b border-gray-300">
      <div class="flex items-center mb-2 font-bold">
        <div class="w-32">True Positive</div>
        <div class="flex-grow">
          <div class="h-6 bg-teal-600" style={`width: ${conf_width.tp}%;`}>
          </div>
        </div>
        <div>{tp}</div>
      </div>
      <div class="flex items-center mb-2 font-bold">
        <div class="w-32">False Positive</div>
        <div class="flex-grow">
          <div class="h-6 bg-teal-600" style={`width: ${conf_width.fp}%;`}>
          </div>
        </div>
        <div>{fp}</div>
      </div>
      <div class="flex items-center mb-2 font-bold">
        <div class="w-32">True Negative</div>
        <div class="flex-grow">
          <div class="h-6 bg-teal-600" style={`width: ${conf_width.tn}%;`}>
          </div>
        </div>
        <div>{tn}</div>
      </div>
      <div class="flex items-center mb-2 font-bold">
        <div class="w-32">False Negative</div>
        <div class="flex-grow">
          <div class="h-6 bg-teal-600" style={`width: ${conf_width.fn}%;`}>
          </div>
        </div>
        <div>{fn}</div>
      </div>
    </div>

    <div class="w-full my-6 px-12">
      <div class="font-semibold text-lg">Akurasi: {(accuracy * 100).toFixed(2)} %</div>
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
</JoAsyncContent>
