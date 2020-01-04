class StorageService {
    storage = null;
    correlative = 'sw'

    constructor (typeStorage) {
      this.storage = typeStorage
    }

    /**
     *
     *
     * @memberof StorageService
     */
    clear () {
      this.storage.clear()
    }

    /**
    *
    *
    * @param {*} item
    * @returns
    * @memberof StorageService
    */
    get (item) {
      return this.storage.getItem(`${this.correlative}-${item}`)
    }

    /**
     *
     *
     * @param {*} name
     * @param {*} item
     * @memberof StorageService
     */
    set (item, value) {
      // eslint-disable-next-line valid-typeof
      let valueConverted = (typeof value === 'object' || typeof value === 'array') ? JSON.stringify(value) : value
      this.storage.setItem(`${this.correlative}-${item}`, valueConverted)
    }
}

export { StorageService }
