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
}

export { GeneralService }
