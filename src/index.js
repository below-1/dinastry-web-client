import 'regenerator-runtime/runtime'
import App from './components/app.svelte';
import './styles/index.css';
import "threads/register";

const app = new App({
  target: document.getElementById('root')
})

export default app;
