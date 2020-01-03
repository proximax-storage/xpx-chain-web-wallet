class Config {
  constructor (configObject) {
    this.coin = configObject.coin
    this.mosaic = configObject.mosaic
    this.namespace = configObject.namespace
    this.nodes = configObject.nodes
    this.networkType = configObject.networkType
    this.mosaicRentalFeeSink = configObject.rentalFeeSink.mosaicRentalFeeSink
    this.namespaceRentalFeeSink = configObject.rentalFeeSink.namespaceRentalFeeSink
    this.version = configObject.version
  }
}

export { Config }
