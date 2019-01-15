import { Injectable } from "@angular/core";
import { NetworkType, MosaicInfo, MosaicId } from "proximax-nem2-sdk";
import {
  BlockchainNetworkType,
  BlockchainNetworkConnection,
  ConnectionConfig,
  IpfsConnection,
} from "xpx2-ts-js-sdk";
import { environment } from "../../../environments/environment";
import { NemProvider } from "./nem.provider";

@Injectable({
  providedIn: 'root'
})
export class ProximaxProvider {

  infoMosaic: MosaicInfo;

  constructor(
    private nemProvider: NemProvider
  ) {

  }

  getBlockchainNetworkType(network: NetworkType): BlockchainNetworkType {
    switch (network) {
      case NetworkType.MAIN_NET:
        return BlockchainNetworkType.MAIN_NET;
      case NetworkType.MIJIN:
        return BlockchainNetworkType.MIJIN;
      case NetworkType.MIJIN_TEST:
        return BlockchainNetworkType.MIJIN_TEST;
      case NetworkType.TEST_NET:
        return BlockchainNetworkType.TEST_NET;
    }
  }

  BlockchainNetworkConnection(network: NetworkType) {
    const blockChainNetworkType = this.getBlockchainNetworkType(network);
    return new BlockchainNetworkConnection(
      blockChainNetworkType,
      environment.blockchainConnection.host,
      environment.blockchainConnection.port,
      environment.blockchainConnection.protocol
    )
  }

  createConnectionWithLocalIpfsConnection(connection: BlockchainNetworkConnection) {
    return ConnectionConfig.createWithLocalIpfsConnection(
      connection,
      new IpfsConnection(environment.storageConnection.host, environment.storageConnection.port, environment.storageConnection.options)
    );
  }

  async getInfoMosaic(mosaicId: MosaicId) {
    console.log("Procede a buscar la información del mosaico");
    const promise = new Promise(async (resolve, reject) => {
      if (this.infoMosaic === undefined) {
        console.warn("No la tiene en caché, la busca.");
        this.infoMosaic = await this.nemProvider.getMosaic(mosaicId).toPromise();
        this.setInfoMosaic(this.infoMosaic);
        resolve(this.infoMosaic);
      }else {
        console.info("La tiene en caché");
        resolve(this.infoMosaic);
      }
    });
    return await promise;
  }

  setInfoMosaic(mosaicInfo: MosaicInfo) {
    this.infoMosaic = mosaicInfo;
  }

  destroyInfoMosaic() {
    this.infoMosaic = undefined;
  }


}
