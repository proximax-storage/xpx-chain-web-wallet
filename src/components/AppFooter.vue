<template>
  <div class="columns">
    <div class="column text-left">
      <div class="btn-group">
        <a href="https://proximax.io" target="_blank">
          <img
            src="@/assets/images/logo.svg"
            class="img-responsive"
            width="50"
          />
        </a>
        <a
          class="btn btn-link h4"
          href="https://www.proximax.io/en/xpx"
          target="_blank"
          >XPX</a
        >
        <a
          class="btn btn-link h4"
          href="https://www.proximax.io/en/#faqs"
          target="_blank"
          >FAQs</a
        >
        <a
          class="btn btn-link h4"
          href="https://www.proximax.io/en/#support"
          target="_blank"
          >Contact</a
        >
      </div>
    </div>
    <div class="column col-md-1 text-right">
      <a class="btn btn-link" @click="scrollToTop"
        ><span class="hide-md">Back to top </span
        ><i class="icon icon-arrow-up ml-2"></i
      ></a>
    </div>
  </div>
  <hr />
  <div class="column col-md-12 items-right">
    <a
      class="btn btn-link s-circle"
      href="http://t.me/ProximaXio"
      target="_blank"
      ><FontAwesomeIcon :icon="['fab', 'telegram-plane']" size="lg"
    /></a>
    <a
      class="btn btn-link s-circle"
      href="https://twitter.com/ProximaXio"
      target="_blank"
      ><FontAwesomeIcon :icon="['fab', 'twitter']" size="lg"
    /></a>
    <a
      class="btn btn-link s-circle"
      href="https://github.com/proximax-foundry"
      target="_blank"
      ><FontAwesomeIcon :icon="['fab', 'github']" size="lg"
    /></a>
    <a
      class="btn btn-link s-circle"
      href="https://www.instagram.com/proximaxio"
      target="_blank"
      ><FontAwesomeIcon :icon="['fab', 'instagram']" size="lg"
    /></a>
    <a
      class="btn btn-link s-circle"
      href="https://www.reddit.com/r/ProximaXOfficial"
      target="_blank"
      ><FontAwesomeIcon :icon="['fab', 'reddit-alien']" size="lg"
    /></a>
    <a
      class="btn btn-link s-circle"
      href="https://www.facebook.com/ProximaXio"
      target="_blank"
      ><FontAwesomeIcon :icon="['fab', 'facebook-f']" size="lg"
    /></a>
    <a
      class="btn btn-link s-circle"
      href="https://medium.com/@proximaxio"
      target="_blank"
      ><FontAwesomeIcon :icon="['fab', 'medium-m']" size="lg"
    /></a>
    <a
      class="btn btn-link s-circle"
      href="https://www.youtube.com/channel/UCky9HP0VlqsnGQWrbMPFVnw"
      target="_blank"
      ><FontAwesomeIcon :icon="['fab', 'youtube']" size="lg"
    /></a>
    <a
      class="btn btn-link s-circle"
      href="https://www.linkedin.com/company/proximaxio"
      target="_blank"
      ><FontAwesomeIcon :icon="['fab', 'linkedin-in']" size="lg"
    /></a>
    <a
      class="btn btn-link s-circle"
      href="https://blockfolio.com/coin/XPX"
      target="_blank"
      ><FontAwesomeIcon :icon="['fab', 'btc']" size="lg"
    /></a>
  </div>
  <div class="column col-md-12 items-left">
    <div>
      Copyright &copy; {{ thisYear }}. ProximaX <sup>&reg;</sup>. All rights
      reserved.
    </div>
    <a
      class="btn btn-link text-bold"
      href="https://www.proximax.io/en/terms-of-use"
      target="_blank"
      >Terms of Use</a
    >
    <a
      class="btn btn-link text-bold"
      href="https://www.proximax.io/en/privacy"
      target="_blank"
      >Privacy Policy</a
    >
    <a
      class="btn btn-link text-bold"
      href="https://www.proximax.io/en/cookies"
      target="_blank"
      >Cookie Policy</a
    >
  </div>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faTelegramPlane,
  faTwitter,
  faGithub,
  faInstagram,
  faRedditAlien,
  faFacebookF,
  faMediumM,
  faYoutube,
  faLinkedinIn,
  faBtc,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed, inject } from "vue";

export default {
  name: "AppFooter",
  components: {
    FontAwesomeIcon,
  },
  setup() {
    const siriusStore = inject("siriusStore");
    const thisYear = computed(() => new Date().getFullYear());

    const scrollToTop = () => {
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    };

    library.add(
      faTelegramPlane,
      faTwitter,
      faGithub,
      faInstagram,
      faRedditAlien,
      faFacebookF,
      faMediumM,
      faYoutube,
      faLinkedinIn,
      faBtc
    );

    return {
      siriusStore,
      scrollToTop,
      thisYear,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/main";
@import "spectre.css/src/variables";

.column {
  padding: $unit-6 $unit-2;
}

.items-left {
  text-align: left;
}

.items-right {
  padding-right: 0;
  margin-top: $unit-2;
  float: right;
  text-align: right;
}

@media (max-width: $size-md) {
  .items-left,
  .items-right {
    float: none;
    text-align: center;
  }
}
</style>
