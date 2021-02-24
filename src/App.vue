<template>
  <header class="bg-gradient">
    <section class="container grid-xl">
      <keep-alive>
        <AppHeader />
      </keep-alive>
    </section>
  </header>

  <section class="container grid-xl full-height">
    <router-view />
  </section>

  <footer>
    <section class="container grid-xl">
      <AppFooter />
    </section>
  </footer>
</template>

<script>
import { provide } from "vue";
import { appStore } from "@/store/app";
import { siriusStore } from "@/store/sirius";
import AppFooter from "@/components/AppFooter.vue";
import AppHeader from "@/components/AppHeader.vue";

export default {
  name: appStore.name,
  components: {
    AppFooter,
    AppHeader,
  },
  setup() {
    provide("appStore", appStore);
    provide("siriusStore", siriusStore);
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap");
@import "@/assets/main";
@import "spectre.css/src/variables";
@import "spectre.css/src/mixins";
@import "spectre.css/src/normalize";
@import "spectre.css/src/base";
@import "spectre.css/src/typography";
@import "spectre.css/src/asian";
@import "spectre.css/src/tables";
@import "spectre.css/src/buttons";
@import "spectre.css/src/forms";
@import "spectre.css/src/labels";
@import "spectre.css/src/codes";
@import "spectre.css/src/media";
@import "spectre.css/src/layout";
@import "spectre.css/src/cards";
@import "spectre.css/src/empty";
@import "spectre.css/src/utilities";
@import "spectre.css/src/animations";
@import "spectre.css/src/spectre-icons";

h1,
h2,
h3,
h4,
h5,
h6,
.h1,
.h2,
.h3,
.h4,
.h5,
.h6 {
  color: $primary-color;
  font-family: $title-font-family;
}

a {
  &:focus,
  &:hover,
  &:active,
  &.active {
    color: $primary-color;
    transition: 0.3s;
    text-decoration: underline;
  }

  &:visited {
    color: $link-color-light;
  }
}

.btn {
  &.btn-link {
    color: $dark-color;

    &:focus,
    &:hover {
      color: $primary-color;
      transition: 0.3s;
      text-decoration: underline;
    }
  }
}

.card {
  @include shadow-variant($unit-o);
}

.input-group {
  .select-fit {
    flex: 0 0 auto;
  }
}

.table {
  thead {
    background: $dark-color;
    color: $light-color;
  }
}

@media (max-width: $size-lg) {
  .table:not(.table-scroll) {
    &.table-stack {
      thead th {
        display: none;
      }

      tr {
        border-bottom: $border-width solid $border-color;

        &:first-child {
          border-top: $border-width solid $border-color;
        }
      }

      td,
      th {
        border-bottom: 0;
        display: block;

        &[data-th]::before {
          content: attr(data-th);
          display: block;
          font-weight: bold;
        }
      }
    }
  }
}

#app {
  min-width: $size-sm;
}

header {
  color: $light-color;
  margin-bottom: $unit-2;
}

footer {
  background: $gray-color-light;
  margin-top: $unit-2;
}

.full-height {
  min-height: 100vh;
}

.bg-gradient {
  background: -webkit-linear-gradient(top, #33b7d2, #0f7084);
}
</style>
