import { shuffle, take, slice, range } from 'lodash';
import { create_predictor } from './predict.js';
import create_row_converter from 'dinastry/services/row_converter';

export function in_bound (range, value) {
  // Lower bound
  let lower_bound_ok = false;
  let upper_bound_ok = false;

  if (range.lower_bound !== undefined && range.min !== undefined) {
    if (range.lower_bound == '<') {
      if (range.min < value) {
        lower_bound_ok = true;
      }
    } else {
      if (range.min <= value) {
        lower_bound_ok = true;
      }
    }
  } else {
    lower_bound_ok = true;
  }

  if (range.upper_bound !== undefined && range.max !== undefined) {
    if (range.upper_bound == '<') {
      if (value < range.max) {
        upper_bound_ok = true;
      }
    } else {
      if (value <= range.max) {
        upper_bound_ok = true;
      }
    }
  } else {
    upper_bound_ok = true;
  }

  return lower_bound_ok && upper_bound_ok;
}

function build_sub_attribute (crit) {
  const subs = crit.kind == 'numeric' ? crit.ranges : crit.options;
  return subs.reduce((acc, curr) => {
    acc[curr.value] = 0;
    return acc;
  }, {});
}

function build_result_structure (criteria) {
  let result = {
    1: { count: 0, attributes: {} },
    0: { count: 0, attributes: {} }
  };
  criteria.forEach(c => {
    result[1].attributes[c.key] = build_sub_attribute(c);
    result[0].attributes[c.key] = build_sub_attribute(c);
  })
  return result;
}

function summary({ data, criterias }) {
	let result = build_result_structure(criterias);
	const keys = criterias.map(c => c.key);
	data.forEach(d => {
		result[d._class].count += 1
		criterias.forEach(c => {
			const x = d[c.key];
			if (c.kind == 'numeric') {
        const range = c.ranges.find(range => in_bound(range, x));
        try {
          result[d._class].attributes[c.key][range.value] += 1;
        } catch (err) {
          console.log(c)
          console.log(x)
          throw err;
        }
      } else {
        const o = c.options.find(o => o.value == x);
        try {
          result[d._class].attributes[c.key][o.value] += 1;
        } catch (err) {
          console.log(c)
          console.log(x)
          throw err;
        }
      }
		})
	})
	return result;
}

export default function testing ({ data, criterias }) {
	const ratios = [0.1, 0.2, 0.3];
	const n_run = 10;
	const row_converter = create_row_converter(criterias);
	return ratios.map(test_ratio => {
		return range(n_run).map(irun => {
			let all = shuffle(data);
		  const n_test = Math.floor(all.length * test_ratio);
		  const test_data = slice(all, 0, n_test);
		  const train_data = slice(all, n_test);
			const summ = summary({ data: train_data, criterias });
			const predictor = create_predictor({ summary: summ, smooth: 1, total: train_data.length });

			let tp = 0;
			let fp = 0;
			let tn = 0;
			let fn = 0;

			test_data.forEach(d => {
				const input = row_converter(d);
	      const r = predictor(input);

	      if (d._class == 1 && r.cls == 1) {
	        tp += 1;
	      } else if (d._class == 0 && r.cls == 1) {
	        fp += 1;
	      } else if (d._class == 0 && r.cls == 0) {
	        tn += 1;
	      } else if (d._class == 1 && r.cls == 0) {
	        fn += 1;
	      }
			})

			const acc = ((tp + tn) / (test_data.length)) * 100;
	    const prec = (tp / (tp + fp)) * 100;
	    const recall = (tp / (tp + fn)) * 100;
	    const f1 = (2 * prec * recall) / (prec + recall);

			return {
				tp, fp, tn, fn,
				acc, prec, recall, f1
			};
		})
	})
	// console.log(data.length);
	// console.log(acc);
  // console.log(`length of test ${test_data.length}`);
  // console.log(`length of train ${train_data.length}`);
}