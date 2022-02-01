import { expose } from "threads/worker"
import testing from './testing.js';

expose({
	run: testing
})