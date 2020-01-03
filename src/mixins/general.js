export default {
  methods: {
    buildStructureService (t, s, d, i, r, ch, vch, cn) {
      return {
        title: t,
        show: s,
        description: d,
        image: i,
        route: r,
        children: ch,
        viewChildren: vch,
        className: cn
      }
    },
    doCopy (text) {
      this.$copyText(text).then((e) => {
        this.$store.dispatch('showMSG', {
          snackbar: true,
          text: `Copied`,
          color: 'success'
        })
      }, (e) => {
        console.log(e)
        this.$store.dispatch('showMSG', {
          snackbar: true,
          text: `Can not copy`,
          color: 'error'
        })
      })
    },
    getConfigForm () {
      return {
        generalRules: {
          notAllowSpaces: v => (v || '').indexOf(' ') < 0 || 'No spaces are allowed'
        },
        username: {
          label: 'User name',
          min: 4,
          max: 15,
          rules: {
            required: v => !!v || 'User name is required',
            min: v =>
              (v && v.length >= 4) || 'User name must be less than 4 characters',
            max: v =>
              (v && v.length <= 15) || 'User name must be a maximum of 15 characters'
          }
        },
        name: {
          label: 'Name',
          min: 3,
          max: 20,
          rules: {
            required: v => !!v || 'Name is required',
            min: v => (v && v.length >= 3) || 'Name must be less than 3 characters',
            max: v => (v && v.length <= 20) || 'Name must be a maximum of 20 characters'
          }
        },
        lastname: {
          label: 'Last name',
          min: 3,
          max: 20,
          rules: {
            required: v => !!v || 'Last name is required',
            min: v =>
              (v && v.length >= 3) || 'Last name must be less than 3 characters',
            max: v =>
              (v && v.length <= 20) || 'Last name must be a maximum of 20 characters'
          }
        },
        password: {
          label: 'Password',
          min: 8,
          max: 20,
          show: false,
          showConfirm: false,
          rules: {
            required: value => !!value || 'Password is required',
            min: v =>
              (v && v.length >= 8) || 'Password must be less than 8 characters',
            max: v =>
              (v && v.length <= 25) || 'Password must be a maximum of 25 characters'
          }
        },
        email: {
          label: 'Email',
          min: 5,
          max: 40,
          rules: {
            required: v => !!v || 'E-mail is required',
            min: v => (v && v.length >= 5) || 'Email must be less than 5 characters',
            max: v =>
              (v && v.length <= 40) || 'Email must be a maximum of 40 characters',
            isValid: v => /.+@.+/.test(v) || 'E-mail must be valid'
          }
        }
      }
    },
    isMatch (value1, value2, nameValidation = '') {
      return value1 === value2 || `${nameValidation} must match`
    },
    removeSpaces (input) {
      return (input) ? input.replace(/ /g, '') : input
    },
    toTitleCase (str) {
      return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      })
    }
  }
}
