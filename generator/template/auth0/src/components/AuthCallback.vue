<template>
  <div></div>
</template>

<script>
import auth from '../auth'

export default {
  mounted() {
    auth.handleCallback((err) => {
      if (err) {
        throw new Error('Unable to authenticate')
      }

      this.$router.go(-2)
    })
  }
};
</script>
