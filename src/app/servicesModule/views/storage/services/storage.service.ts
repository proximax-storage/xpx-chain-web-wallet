import { PrivacyType } from 'xpx2-ts-js-sdk';
export interface SearchResultInterface {
  name: string;
  contentType: string;
  contentTypeIcon: string;
  encryptionType: PrivacyType;
  encryptionTypeIcon: string;
  description: string;
  timestamp: string;
  dataHash: string;
}
