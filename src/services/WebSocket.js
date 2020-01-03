import {
  Listener
} from 'tsjs-xpx-chain-sdk'

export default class WebSocketProvider {
    connector = [];
    audio = new Audio('assets/audio/ding.ogg');
    audio2 = new Audio('assets/audio/ding2.ogg');

    /**
     *
     *
     * @memberof WebsocketProvider
     */
    closeConection () {
      if (this.connector.length > 0) {
        this.connector.forEach(element => {
          element.close()
          element.terminate()
        })
      }
    }

    /**
     *
     *
     * @param {*} connector
     * @param {*} address
     * @memberof WebSocketProvider
     */
    getBlock (connector, address, audio) {
      connector.newBlock(address).subscribe(block => {
        audio.play()
        console.log('--------------------NEW_BLOCK------------------------', block)
      })
    }

    /**
     *
     *
     * @param {*} connector
     * @param {*} address
     * @memberof WebSocketProvider
     */
    getAggregateBondedAdded (connector, address, audio) {
      connector.aggregateBondedAdded(address).subscribe(aggregateBondedAdded => {
        audio.play()
        console.log('--------------------AGGREGATE_BONDED_ADDED------------------------')
        console.log(aggregateBondedAdded.transactionInfo.hash)
        console.log('------------------------------------------------------------------\n\n')
      })
    }

    /**
     *
     *
     * @param {*} connector
     * @param {*} address
     * @memberof WebSocketProvider
     */
    getAggregateBondedRemoved (connector, address, audio) {
      connector.aggregateBondedRemoved(address).subscribe(getAggregateBondedRemoved => {
        audio.play()
        console.log('-----------------------AGGREGATE_BONDED_REMOVED--------------------------')
        console.log(getAggregateBondedRemoved)
        console.log('------------------------------------------------------------------\n\n')
      })
    }

    /**
     *
     *
     * @param {*} connector
     * @param {*} address
     * @memberof WebSocketProvider
     */
    getCosignatureAdded (connector, address, audio) {
      connector.cosignatureAdded(address).subscribe(cosignatureAdded => {
        audio.play()
        console.log('-----------------------COSIGNATURE_ADDED--------------------------')
        console.log(cosignatureAdded)
        console.log('------------------------------------------------------------------\n\n')
      })
    }

    /**
     *
     *
     * @param {*} connector
     * @param {*} address
     * @memberof WebSocketProvider
     */
    getConfirmed (connector, address, audio) {
      connector.confirmed(address).subscribe(confirmedTransaction => {
        audio.play()
        console.log(' -----------------------CONFIRMED---------------------------------')
        console.log(confirmedTransaction.transactionInfo.hash)
        console.log('------------------------------------------------------------------ \n\n')
      })
    }

    /**
     *
     *
     * @param {*} connector
     * @param {*} address
     * @memberof WebSocketProvider
     */
    getUnConfirmedAdded (connector, address, audio) {
      connector.unconfirmedAdded(address).subscribe(unconfirmedAdded => {
        audio.play()
        console.log('-----------------------UNCONFIRMED_ADDED--------------------------')
        console.log(unconfirmedAdded)
        console.log('------------------------------------------------------------------\n\n')
      })
    }

    /**
     *
     *
     * @param {*} connector
     * @param {*} address
     * @memberof WebSocketProvider
     */
    getUnConfirmedRemoved (connector, address, audio) {
      connector.unconfirmedRemoved(address).subscribe(unconfirmedRemoved => {
        audio.play()
        console.log('-----------------------UNCONFIRMED_REMOVED--------------------------')
        console.log(unconfirmedRemoved)
        console.log('------------------------------------------------------------------\n\n')
      })
    }

    /**
     *
     *
     * @param {*} connector
     * @param {*} address
     * @memberof WebSocketProvider
     */
    getStatus (connector, address, audio) {
      connector.status(address).subscribe(status => {
        audio.play()
        console.log('-----------------------STATUS--------------------------')
        console.log(status.hash)
        console.log(status)
        console.log('------------------------------------------------------------------\n\n')
      })
    }

    /**
     *
     *
     * @param {*} address
     * @memberof WebSocketProvider
     */
    openConnection (address) {
      console.log(this.ProximaxProvider)
      return new Promise((resolve, reject) => {
        const rawAddress = this.ProximaxProvider.createFromRawAddress(address)
        const connector = new Listener(this.url, WebSocket)
        connector.open().then(() => {
          this.connector.push(connector)
          this.getAggregateBondedAdded(connector, rawAddress, this.audio)
          this.getAggregateBondedRemoved(connector, rawAddress, this.audio2)
          this.getCosignatureAdded(connector, rawAddress, this.audio)
          this.getConfirmed(connector, rawAddress, this.audio)
          this.getUnConfirmedAdded(connector, rawAddress, this.audio2)
          this.getUnConfirmedRemoved(connector, rawAddress, this.audio2)
          this.getStatus(connector, rawAddress, this.audio2)
          resolve(true)
        }, () => {
          console.log('Error connecting to the node')
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(false) // Error
        })
      }, () => {
        // eslint-disable-next-line no-undef
        reject(false) // Error
      })
    }
}
