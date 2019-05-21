import {
  NamespaceInfo,
  MosaicInfo,
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
  mosaicInfo: MosaicInfo;
  infoComplete: boolean;
}
