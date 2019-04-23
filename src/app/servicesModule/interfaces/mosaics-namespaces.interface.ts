import {
  NamespaceInfo,
  MosaicInfo,
  MosaicName,
  NamespaceName
} from "proximax-nem2-sdk";

export interface NamespaceStorage {
  id: number[];
  namespaceName: NamespaceName;
  NamespaceInfo: NamespaceInfo;
}

export interface MosaicsStorage {
  id: number[];
  mosaicName: MosaicName;
  mosaicInfo: MosaicInfo;
}
