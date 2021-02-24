import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import filters from "@/filters";

const app = createApp(App);

app.config.globalProperties.$filters = filters;
app.use(router).mount("#app");
