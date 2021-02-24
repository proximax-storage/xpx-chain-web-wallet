<template>
  <div class="card">
    <div class="card-header">
      <div class="card-subtitle">
        Primary Account
      </div>
      <div class="card-title h4">
        {{ accountInfo.address.plain() }}
      </div>
    </div>
    <div class="card-body m-2">
        {{ accountInfo }}
    </div>
  </div>
</template>

<script>
export default {
  name: "AccountCard",
  props: {
    accountInfo: {
      type: Object,
      default: null,
    },
  },
};
</script>
