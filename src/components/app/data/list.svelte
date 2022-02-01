<script>
  import { onMount } from 'svelte';
  import { push as push_route } from 'svelte-spa-router';
  import FaPencilAlt from 'svelte-icons/fa/FaPencilAlt.svelte'
  import FaTrash from 'svelte-icons/fa/FaTrash.svelte'
  import ViewNav from './view_nav.svelte';
  import JoAsyncContent from 'dinastry/components/commons/JoAsyncContent.svelte';
  import JoInput from 'dinastry/components/commons/JoInput.svelte';
  import JoButton from 'dinastry/components/commons/JoButton.svelte';
  import all_criteria from 'dinastry/services/all_criteria';
  import all_rows from 'dinastry/services/rows';
  import count_rows from 'dinastry/services/count_rows';
  import format_numeric from 'dinastry/services/format_numeric.js';
  import truncate from 'dinastry/services/rows_truncate.js';
  import del from 'dinastry/services/row_delete.js';
  import 'dinastry/styles/jo-table.css';

  let take = 10;
  let criteria = [];
  let hidden_criteria = [];
  let rows = [];
  let keyword = '';
  let networkStatus = 'loading';
  let total_data = 0;
  let total_layak = 0;
  let total_tidak_layak = 0;

  $: filtered_criteria = criteria.filter(c => !hidden_criteria.includes(c.key));
  $: layak_count = rows.filter(it => it._class).length;
  $: tdk_layak_count = rows.length - layak_count;
  $: skip = calc_skip(rows);
  $: getData({ take, keyword, skip });

  async function getData ({ take, keyword, skip }) {
    try {
      networkStatus = 'loading';
      rows = await all_rows({ take, keyword, skip });
      const count_data = await count_rows({ keyword })
      total_data = count_data.count;
      total_layak = count_data.layak;
      total_tidak_layak = count_data.tidak_layak;
      networkStatus = 'success';
    } catch (err) {
      console.log(err);
      alert('gagal mengambil data');
      networkStatus = 'error';
    }
  }

  function calc_skip (rows) {
    // rows.length > 0 ? rows[rows.length].nama : null;
    console.log(rows);
    return skip;
  }

  function hide_criteria (key) {
    hidden_criteria = [...hidden_criteria, key];
  }

  function show_criteria (key) {
    hidden_criteria = hidden_criteria.filter(k => k != key);
  }

  async function load_data () {
    networkStatus = 'loading';
    try {
      criteria = await all_criteria();
      rows = await all_rows({ take });
      const count_data = await count_rows({ keyword: '' })
      total_data = count_data.count;
      total_layak = count_data.layak;
      total_tidak_layak = count_data.tidak_layak;
      networkStatus = 'success';
    } catch (err) {
      console.log(err);
      networkStatus = 'error';
    }
  }

  async function on_truncate () {
    networkStatus = 'loading';
    try {
      await truncate();
      networkStatus = 'success';
    } catch (err) {
      console.log(err);
      networkStatus = 'error';
    } finally {
      setTimeout(() => {
        load_data();
      }, 1200);
    }
  }

  async function on_delete (id) {
    networkStatus = 'loading';
    try {
      await del(id)
      networkStatus = 'success';
    } catch (err) {
      console.log(err);
      networkStatus = 'error';
    } finally {
      load_data();
    }
  }

  onMount(load_data);
</script>

<ViewNav/>
<JoAsyncContent {networkStatus}>
  <div slot="success" class="w-full my-6 px-12">
    <div class="flex flex-wrap items-center my-6">
      {#each criteria as crit (crit.key)}
        <div 
          class="bg-gray-300 rounded border border-gray-200 font-semibold p-1 mr-3 flex items-center"
        >
          <input 
            checked={!hidden_criteria.includes(crit.key)}
            type="checkbox"
            on:change={() => {
              if (hidden_criteria.includes(crit.key)) {
                show_criteria(crit.key);
              } else {
                hide_criteria(crit.key);
              }
            }}
          />
          <span class="text-xs">{crit.label}</span>
        </div>
      {/each}
    </div>
    <div class="my-6 flex items-center">
      <div class="mr-2 font-bold">Total Data: {total_data}</div>
      <div class="mr-2 font-bold">/Layak: {total_layak}</div>
      <div class="mr-2 font-bold">/Tidak Layak: {total_tidak_layak}</div>
      <JoInput bind:value={keyword} placeholder="keyword..." />
      <JoButton action={on_truncate} dark color="red" label="kosongkan" />
    </div>
    <table class="jo-table">
      <thead>
        <tr>
          <th>Nama</th>
          {#each filtered_criteria as crit (crit.key)}
            <th class="text-xs">{crit.key.substring(0, 4)}</th>
          {/each}
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row (row._id)}
          <tr class="text-xs">
            <td>{row.nama}</td>
            {#each filtered_criteria as crit (crit.key)}
              <td>
                <span class="mr-1">{row[crit.key]}</span>
                {#if (crit.kind == 'numeric')}
                  <span class="px-1 bg-gray-200">{format_numeric(crit, row[crit.key])}</span>
                {/if}
              </td>
            {/each}
            <td>
              {row._class == 1 ? 'Layak' : 'Tidak Layak'}
            </td>
            <td class="flex items-center justify-end">
              <JoButton 
                action={() => {
                  on_delete(row._id)
                }}
                dark 
                color="red" 
                cls="p-1 rounded-full mr-1"
              >
                <div class="h-3 w-3">
                  <FaTrash/>
                </div>
              </JoButton>
              <JoButton 
                action={() => {
                  push_route(`/app/data/update/${row._id}`)
                }}
                dark 
                color="blue" 
                cls="p-1 rounded-full"
              >
                <div class="h-3 w-3">
                  <FaPencilAlt/>
                </div>
              </JoButton>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <div class="my-6">
      <JoButton label="perbanyak" action={() => {
        take += 10;
      }}/>
      <JoButton label="kurangi"
        action={() => {
          if (rows.length <= 10) {
            return;
          }
          take -= 10;
        }}
      />
    </div>
  </div>
</JoAsyncContent>

