<script>
	import { zip } from 'lodash';

	export let params = {};
	$: partition = params.partition ? parseInt(params.partition) : null;
	$: ratio_index = params.ratio_index ? parseInt(params.ratio_index) : null;

	let tp = 0;
	let fp = 0;
	let tn = 0;
	let fn = 0;

	$: extract_data({ partition, ratio_index });

	function extract_data ({ partition, ratio_index }) {
		if (partition == null) return;
		if (ratio_index == null) return;
		const raw = localStorage.getItem('dinastry.test_results');
  	const results = JSON.parse(raw);
  	const test_results = zip(...results);
  	const target = test_results[partition][ratio_index];
  	console.log(partition);
  	console.log(test_results);
  	console.log(target.tp);
  	tp = target.tp;
  	fp = target.fp;
  	tn = target.tn;
  	fn = target.fn;
	}
</script>

<div class="w-full bg-blue-800 text-white flex items-center justify-start px-12 h-20">
  <div class="font-bold text-2xl">Detail Partisi {partition + 1}</div>
  <div class="flex-grow"></div>
</div>

<ul class="px-12">
	<li class="px-4 border-b border-gray-300 py-4 text-gray-700 font-bold text-xl">True Positive: {tp}</li>
	<li class="px-4 border-b border-gray-300 py-4 text-gray-700 font-bold text-xl">True Negative: {tn}</li>
	<li class="px-4 border-b border-gray-300 py-4 text-gray-700 font-bold text-xl">False Positive: {fp}</li>
	<li class="px-4 border-b border-gray-300 py-4 text-gray-700 font-bold text-xl">False Negative: {fn}</li>
</ul>