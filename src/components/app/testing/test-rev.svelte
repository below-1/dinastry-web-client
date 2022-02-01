<script>
  import { onMount } from 'svelte';
  import Router, { push as push_route } from 'svelte-spa-router';
  import JoButton from 'dinastry/components/commons/JoButton.svelte';
  import JoAsyncContent from 'dinastry/components/commons/JoAsyncContent.svelte';
  import axios from 'dinastry/services/axios.js';
  import create_row_converter from 'dinastry/services/row_converter';
  import all_criteria from 'dinastry/services/all_criteria';
  import { create_predictor } from 'dinastry/services/predict';
  import get_nb_summary from 'dinastry/services/nb_summary';
  import TestDetail from './test-detail.svelte';
  import testing from 'dinastry/services/testing.js';
  import { spawn, Thread, Worker } from "threads"

  const ratios = [0.1, 0.2, 0.3];

  let test_data = [];
  let data = [];
  let criteria = [];
  let row_converter;
  let predict;
  let networkStatus = 'ready';
  let errorMessage = '';
  let result = [];
  let test_results = [];
  let test_inputs = [];

  const routes = {
    '/:id': TestDetail
  }
  const prefix = '/app/testing';

  function test_part (part) {
    const { test_data, predict, row_converter } = part;
    let tp = 0;
    let fp = 0;
    let tn = 0;
    let fn = 0;
    const result = test_data.map(d => {
      const input = row_converter(d);
      const r = predict(input);

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
    const acc = ((tp + tn) / (result.length)) * 100;
    const prec = (tp / (tp + fp)) * 100;
    const recall = (tp / (tp + fn)) * 100;
    const f1 = (2 * prec * recall) / (prec + recall);
    return {
      result,
      acc, prec, recall, f1,
      tp, fp, tn, fn
    }
  }

  async function run_testing () {
    networkStatus = 'loading';
    const tester = await spawn(new Worker("../../../services/testing_thread.js"));
    const data_response = await axios.get('/api/data');
    const { data } = data_response;
    const criterias_response = await axios.get('/api/criteria');
    const { data: criterias } = criterias_response;
    const result = await tester.run({ data, criterias })
    localStorage.setItem('dinastry.test_results', JSON.stringify(result));
    push_route('/app/test-result');
    // console.log(result);
    networkStatus = 'success';
    // test_results = test_inputs.map(test_part);
    // networkStatus = 'success';
  }

  async function run_all () {
    try {
      criteria = await all_criteria();
      const xs = ratios.map(r => 
        axios.get('/api/nb/testing', {
          params: {
            test_ratio: r
          }
        })
      );

      const all_test_resp = await Promise.all(xs);
      test_inputs = all_test_resp.map(r => {
        const resp_data = r.data;
        predict = create_predictor({ 
          ...resp_data.summary_result, 
          smooth: 1 
        });
        row_converter = create_row_converter(criteria);
        return {
          ...resp_data,
          predict,
          row_converter
        }
      });
      console.log(test_inputs);
      networkStatus = 'ready';
    } catch (err) {
      networkStatus = 'error';
      errorMessage = 'gagal mengambil data';
      console.log(err);
    }
  }

  onMount(async function () {
    let test_descriptions = [];
    const n_tests = 10;
    networkStatus = 'loading';
    try {
      criteria = await all_criteria();
      for (let i = 0; i < n_tests; i++) {
        const promises = ratios.map(r => 
          axios.get('/api/nb/testing', {
            params: {
              test_ratio: r
            }
          })
        );
        const rs = await Promise.all(promises);
        test_descriptions.push(rs.map(r => r.data));
      }
      console.log(test_descriptions);
      
      const xs = ratios.map(r => 
        axios.get('/api/nb/testing', {
          params: {
            test_ratio: r
          }
        })
      );

      const all_test_resp = await Promise.all(xs);
      test_inputs = all_test_resp.map(r => {
        const resp_data = r.data;
        predict = create_predictor({ 
          ...resp_data.summary_result, 
          smooth: 1 
        });
        row_converter = create_row_converter(criteria);
        return {
          ...resp_data,
          predict,
          row_converter
        }
      });
      console.log(test_inputs);
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
          <JoButton cls="my-6 text-lg font-bold p-4" dark color="indigo" label="jalankan" 
            action={run_testing}
          >
          </JoButton>
        </form>
      </div>
    </div>
  </div>
</JoAsyncContent>