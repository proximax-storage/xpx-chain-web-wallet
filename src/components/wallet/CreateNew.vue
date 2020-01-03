<template>
  <div>
    <v-form v-model="valid" ref="form">
      <v-container>
        <!-- Title & Subtitle -->
        <title-subtitle :title="title" :separed1="true"></title-subtitle>
        <v-row>
          <v-col cols="11" sm="8" md="7" lg="6" class="mx-auto">
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  rounded
                  outlined
                  dense
                  v-model="networkSelected"
                  :items="networksType"
                  :hint="getHint"
                  item-text="text"
                  item-value="value"
                  label="Network type"
                  return-object
                  cache-items
                  auto-select-first
                ></v-autocomplete>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  :label="configForm.walletName.label"
                  v-model.trim="walletName"
                  rounded
                  outlined
                  dense
                  :minlength="configForm.walletName.min"
                  :maxlength="configForm.walletName.max"
                  :counter="configForm.walletName.max"
                  :rules="[
                  configForm.walletName.rules.required,
                  configForm.walletName.rules.min,
                  configForm.walletName.rules.max
                ]"
                >
                  <template v-slot:prepend-inner>
                    <img
                      class="pr-2 pt-1"
                      :src="require(`@/assets/img/${configForm.walletName.icon}`)"
                      alt="logo"
                      height="24"
                    />
                  </template>
                </v-text-field>
              </v-col>

              <!-- Password -->
              <v-col cols="12" md="6">
                <v-text-field
                  rounded
                  outlined
                  dense
                  v-model="passwords.password"
                  :append-icon="configForm.password.show ? 'mdi-eye' : 'mdi-eye-off'"
                  :minlength="configForm.password.min"
                  :maxlength="configForm.password.max"
                  :counter="configForm.password.max"
                  :rules="[
                  configForm.password.rules.required,
                  configForm.password.rules.min,
                  configForm.password.rules.max
                ]"
                  :label="configForm.password.label"
                  :type="configForm.password.show ? 'text' : 'password'"
                  name="password"
                  hint
                  @click:append="configForm.password.show = !configForm.password.show"
                >
                  <template v-slot:prepend-inner>
                    <img
                      class="pr-2 pt-1"
                      :src="require(`@/assets/img/${configForm.password.icon}`)"
                      alt="logo"
                      height="24"
                    />
                  </template>
                </v-text-field>
              </v-col>

              <!-- Confirm Password -->
              <v-col cols="12" md="6">
                <v-text-field
                  rounded
                  outlined
                  dense
                  name="confirmPassword"
                  label="Confirm Password"
                  hint="Confirm Password"
                  v-model="passwords.confirmPassword"
                  :append-icon="configForm.password.showConfirm ? 'mdi-eye' : 'mdi-eye-off'"
                  :minlength="configForm.password.min"
                  :maxlength="configForm.password.max"
                  :counter="configForm.password.max"
                  :rules="[
                  configForm.password.rules.required,
                  configForm.password.rules.min,
                  configForm.password.rules.max,
                  isMatch(passwords.password, passwords.confirmPassword, 'Password')
                ]"
                  :type="configForm.password.showConfirm ? 'text' : 'password'"
                  :disabled="disabledConfirmPassword"
                  @click:append="configForm.password.showConfirm = !configForm.password.showConfirm"
                >
                  <template v-slot:prepend-inner>
                    <img
                      class="pr-2 pt-1"
                      :src="require(`@/assets/img/${configForm.password.icon}`)"
                      alt="logo"
                      height="24"
                    />
                  </template>
                </v-text-field>
              </v-col>
            </v-row>

            <!-- Buttons -->
            <custom-buttons
              @click-one="clear"
              @click-two="createWallet"
              :title1="'Clear'"
              :title2="'Create'"
              :loading1="false"
              :loading2="sendingForm"
              :disabled1="sendingForm"
              :disabled2="disableBtnCreate"
            ></custom-buttons>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </div>
</template>

<script>
import generalMixins from '../../mixins/general'

export default {
  mixins: [generalMixins],
  data: () => {
    return {
      title: 'Create Wallet',
      valid: false,
      sendingForm: false,
      configForm: null,
      networkSelected: {
        text: 'Public Test',
        value: 'PUBLIC_TEST'
      },
      networksType: [
        {
          text: 'Public Test',
          value: 'PUBLIC_TEST'
        },
        {
          text: 'Main Net',
          value: 'MAIN_NET'
        }
      ],
      walletName: '',
      passwords: {
        password: '',
        confirmPassword: ''
      }
    }
  },
  components: {
    'title-subtitle': () => import('@/components/shared/Title'),
    'custom-buttons': () => import('@/components/shared/Buttons')
  },
  methods: {
    clear () {
      console.log('clear')
    },
    createWallet () {
      console.log('Create wallet')
    },
    resetConfirmPassword () {
      this.passwords.confirmPassword = ''
    }
  },
  computed: {
    getHint () {
      return this.networkSelected && this.networkSelected.value !== ''
        ? `${this.networkSelected.text}`
        : ''
    },
    disableBtnCreate () {
      return !this.valid || this.sendingForm
    },
    disabledConfirmPassword () {
      const password = this.passwords.password
      if (password) {
        if (password === '' || password.length < this.configForm.password.min) {
          this.resetConfirmPassword()
          return true
        }
        return false
      } else {
        return true
      }
    }
  },
  beforeMount () {
    this.configForm = this.getConfigForm()
  }
}
</script>
