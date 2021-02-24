<template>
  <div class="empty">
    <div class="empty-icon text-error">
      <i class="icon icon-3x icon-stop"></i>
    </div>
    <div class="empty-title h1" :class="{ 'text-small': smallText }">
      {{ error }}
    </div>
  </div>
</template>

<script>
export default {
  name: "ErrorState",
  props: {
    err: {
      type: String,
      default: "Error communicating with selected node",
    },
    smallText: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    return {
      error: props.err,
    };
  },
};
</script>
