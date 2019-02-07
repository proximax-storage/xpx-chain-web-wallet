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

  /* async getInfoMosaic(mosaicId: MosaicId) {
    const promise = await new Promise(async (resolve, reject) => {
      if (this.infoMosaic === undefined) {
        console.warn("Procede a buscar la información del mosaico porque no la tiene en caché");
        this.infoMosaic = await this.nemProvider.getMosaic(mosaicId).toPromise();
        this.setInfoMosaic(this.infoMosaic);
        console.log("Ya va a responder...", this.infoMosaic);
        resolve(this.infoMosaic);
      } else {
        // console.log("Información de mosaico en caché", this.infoMosaic);
        reject(this.infoMosaic);
        // if (this.infoMosaic.mosaicId === mosaicId) {
        //   resolve(this.infoMosaic);
        // } else {
        //   this.infoMosaic = await this.nemProvider.getMosaic(mosaicId).toPromise();
        //   this.setInfoMosaic(this.infoMosaic);
        //   resolve(this.infoMosaic);
        // }
      }
    });

    console.log("RESPUESTA.... ", promise);
    return await promise;
  } */


  async getInfoMosaics(mosaicsId: MosaicId[]) {
    const promise = await new Promise(async (resolve, reject) => {
      console.log("INFO MOSAIC IN GETMOSAIC", this.infoMosaic);
      if (this.infoMosaic === undefined) {
        console.warn("********** INFO MOSAIC ES UNDEFINED **********");
        const mosaicsInfo = await this.nemProvider.getMosaics(mosaicsId).toPromise();
        // this.setInfoMosaic(this.infoMosaic);
        // console.log("Ya va a responder...", this.infoMosaic);
        resolve(mosaicsInfo);
      } else {
        // console.log("Información de mosaico en caché", this.infoMosaic);
        reject(null);
        // if (this.infoMosaic.mosaicId === mosaicId) {
        //   resolve(this.infoMosaic);
        // } else {
        //   this.infoMosaic = await this.nemProvider.getMosaic(mosaicId).toPromise();
        //   this.setInfoMosaic(this.infoMosaic);
        //   resolve(this.infoMosaic);
        // }
      }
    });

    console.log("***RESPUESTA CONSULTA DE MOSAICOS****", promise);
    return await promise;
  }

  setInfoMosaic(mosaicInfo: MosaicInfo) {
    this.infoMosaic = mosaicInfo;
  }

  destroyInfoMosaic() {
    this.infoMosaic = undefined;
  }


}
