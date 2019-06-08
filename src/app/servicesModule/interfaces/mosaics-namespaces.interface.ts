import {
  NamespaceInfo,
  MosaicInfo,
  NamespaceName
} from "tsjs-xpx-catapult-sdk";
import { MosaicNames } from "tsjs-xpx-catapult-sdk/dist/src/model/mosaic/MosaicNames";

export interface NamespaceStorage {
  id: number[];
  namespaceName: NamespaceName;
  NamespaceInfo: NamespaceInfo;
}

export interface MosaicsStorage {
  id: number[];
  mosaicNames: MosaicNames
  mosaicInfo: MosaicInfo;
  infoComplete: boolean;
}
