<template>
  <div class="empty">
    <div class="empty-icon">
      <i class="icon icon-3x icon-delete"></i>
    </div>
    <p class="empty-title h5">Are you sure you want to delete this wallet?</p>
    <p class="empty-subtitle">
      Please ensure you have made the necessary backups
    </p>
    <div class="empty-action">
      <button class="btn btn-primary mr-2" @click="$emit('confirm')">
        Confirm
      </button>
      <button class="btn btn-primary" @click="$emit('cancel')">Cancel</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "DeleteConfirmationState",
  emits: ["confirm", "cancel"],
};
</script>
