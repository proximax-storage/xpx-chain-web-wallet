<template>
  <label class="form-switch">
    <input
      type="checkbox"
      :checked="appStore.state.darkTheme"
      @change="appStore.toggleDarkTheme()"
    />
    <i class="form-icon"></i> Dark Theme
  </label>
</template>

<script>
import { inject } from "vue";

export default {
  name: "ThemeSwitcher",
  setup() {
    const appStore = inject("appStore");

    return {
      appStore,
    };
  },
};
</script>
