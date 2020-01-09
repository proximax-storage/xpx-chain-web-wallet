import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    options: {
      customProperties: true
    },
    themes: {
      light: {
        primary: '#306EB5',
        secondary: '#424242',
        accent: '#82B1FF',
        error: colors.red.darken1,
        info: '#2196F3',
        success: '#306EB5',
        warning: '#f3ad27',
        'gray-light': '#616161',
        'gray-black': '#212529',
        'gray-disabled': '#9a9a9a'
      }
    }
  }
})
