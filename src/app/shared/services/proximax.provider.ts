import { Injectable } from "@angular/core";
import { NetworkType } from "proximax-nem2-sdk";
import {
  BlockchainNetworkType,
  BlockchainNetworkConnection,
  ConnectionConfig,
  IpfsConnection,
} from "xpx2-ts-js-sdk";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ProximaxProvider {

  getBlockchainNetworkType(network: number): BlockchainNetworkType {
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

  BlockchainNetworkConnection(network: number) {
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

 
}
