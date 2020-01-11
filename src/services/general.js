class GeneralService {
  /**
   *
   *
   * @param {*} cant
   * @param {number} [amount=0]
   * @returns
   * @memberof GeneralService
   */
  addZeros (cant, amount = 0) {
    let decimal
    let realAmount
    if (amount === 0) {
      decimal = this.addDecimals(cant)
      realAmount = `0${decimal}`
    } else {
      const arrAmount = amount.toString().replace(/,/g, '').split('.')
      if (arrAmount.length < 2) {
        decimal = this.addDecimals(cant)
      } else {
        const arrDecimals = arrAmount[1].split('')
        decimal = this.addDecimals(cant - arrDecimals.length, arrAmount[1])
      }
      realAmount = `${arrAmount[0]}${decimal}`
    }
    return realAmount
  }

  /**
   *
   *
   * @param {*} cant
   * @param {string} [amount='0']
   * @returns
   * @memberof GeneralService
   */
  addDecimals (cant, amount = '0') {
    const x = '0'
    if (amount === '0') {
      for (let index = 0; index < cant - 1; index++) {
        amount += x
      }
    } else {
      for (let index = 0; index < cant; index++) {
        amount += x
      }
    }
    return amount
  }

  /**
   *
   *
   * @param {*} amountParam
   * @param {*} mosaic
   * @param {number} [manualDivisibility=0]
   * @returns
   * @memberof GeneralService
   */
  amountFormatter (amountParam, mosaic, manualDivisibility = 0) {
    const divisibility = (manualDivisibility === 0) ? manualDivisibility : mosaic.properties.divisibility
    const amountDivisibility = Number(amountParam / Math.pow(10, divisibility))
    const amountFormatter = amountDivisibility.toLocaleString('en-us', { minimumFractionDigits: divisibility })
    return amountFormatter
  }

  /**
   *
   *
   * @param {*} str
   * @returns
   * @memberof GeneralService
   */
  isHexadecimal (str) {
    if (str) {
      return str && str.match('^(0x|0X)?[a-fA-F0-9]+$') !== null
    }

    return false
  }

  /**
   *
   *
   * @param {*} value1
   * @param {*} value2
   * @param {string} [nameValidation='']
   * @returns
   * @memberof GeneralService
   */
  isMatch (value1, value2, nameValidation = '') {
    return value1 === value2 || `${nameValidation} must match`
  }

  /**
   *
   *
   * @param {*} conn
   * @param {*} timeOut
   * @returns
   * @memberof GeneralService
   */
  promiseTimeOut (conn, timeOut) {
    return new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('promise timeout')), timeOut)
      conn.toPromise().then(resolve).catch(reject)
    })
  }

  /**
   *
   *
   * @param {*} input
   * @returns
   * @memberof GeneralService
   */
  removeSpaces (input) {
    return (input) ? input.replace(/ /g, '') : input
  }

  /**
   *
   *
   * @param {*} quantityOne
   * @param {*} quantityTwo
   * @param {number} [limitDecimal=6]
   * @returns
   * @memberof GeneralService
   */
  subtractAmount (quantityOne, quantityTwo, limitDecimal = 6) {
    const residue = (quantityOne - quantityTwo).toString().replace(/,/g, '').split('.')
    const missing = (residue.length > 1) ? limitDecimal - residue[1].length : 6
    residue[1] = (residue.length > 1) ? residue[1].slice(0, 6) : ''
    for (let index = 0; index < missing; index++) {
      residue[1] += 0
    }

    return residue.join().replace(/,/g, '.')
  }

  /**
   *
   *
   * @param {*} str
   * @returns
   * @memberof GeneralService
   */
  toTitleCase (str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
  }
}

export { GeneralService }
