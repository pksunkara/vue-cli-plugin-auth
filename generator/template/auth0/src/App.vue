---
extend: '@vue/cli-service/generator/template/src/App.vue'
replace: !!js/regexp /<script>[^]*?<\/script>/
---
<script>
import auth from './auth';

export default {
  name: 'app',
  beforeMount() {
    auth.init()
  }
}
</script>
