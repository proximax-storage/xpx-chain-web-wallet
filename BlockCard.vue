<template>
  <div class="card text-center">
    <div class="card-header">
      <div class="card-subtitle">
        <small class="text-bold">Latest Block</small>
      </div>
      <div class="card-title h4">
        {{ blockInfo.height.compact() }}
      </div>
      <div class="card-subtitle">
        {{
          $filters.getRelativeTimestamp(blockInfo.timestamp).toLocaleString()
        }}
        ({{ timeElapsed }} seconds ago)
      </div>
    </div>
    <div class="card-body bg-gradient text-light m-2">
      <FontAwesomeIcon :icon="['fas', 'cube']" size="lg" />
      Upcoming block: <b>{{ blockInfo.height.compact() + 1 }}</b>
    </div>
  </div>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCube } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed, getCurrentInstance, onMounted, ref } from "vue";

export default {
  name: "BlockCard",
  components: {
    FontAwesomeIcon,
  },
  props: {
    blockInfo: {
      type: Object,
      default: null,
    },
  },
  setup(props) {
    const internalInstance = getCurrentInstance();
    const nowTimestamp = ref(new Date().getTime());

    const timeElapsed = computed(() =>
      Math.floor(
        (nowTimestamp.value -
          internalInstance.appContext.config.globalProperties.$filters.getRelativeTimestamp(
            props.blockInfo.timestamp
          )) /
          1000
      )
    );

    library.add(faCube);

    onMounted(() => {
      setInterval(() => {
        nowTimestamp.value += 1000;
      }, 1000);
    });

    return {
      timeElapsed,
    };
  },
};
</script>
