<template>
  <div>
    <h4>You are forbidden to view this page. Please login.</h4>
  </div>
</template>

<script>
import auth from '../auth'

export default {
  beforeMount() {
    if (auth.isLoggedIn()) {
      this.$router.replace(this.$route.query.redirect)
    }
  }
}
</script>
