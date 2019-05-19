import {
  NamespaceInfo,
  MosaicInfo,
  MosaicName,
  NamespaceName
} from "tsjs-xpx-catapult-sdk";

export interface NamespaceStorage {
  id: number[];
  namespaceName: NamespaceName;
  NamespaceInfo: NamespaceInfo;
}

export interface MosaicsStorage {
  id: number[];
  namespaceName: NamespaceName;
  mosaicName: MosaicName;
  mosaicInfo: MosaicInfo;
  infoComplete: boolean;
}
