import utils from "@/utils";
import { Deadline, UInt64 } from "tsjs-xpx-chain-sdk";

export default {
  ...utils,
  getRelativeTimestamp(blockTimestamp) {
    return new Date(
      blockTimestamp.compact() + Deadline.timestampNemesisBlock * 1000
    );
  },
  blocksToDays(numBlocks) {
    return `~${Math.round(numBlocks / (4 * 60 * 24))} days`;
  },
  // CREDITS: https://gist.github.com/lanqy/5193417
  bytesToSize(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
    if (bytes == 0) {
      return `${bytes} ${sizes[0]}`;
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i == 0) {
      return `${bytes} ${sizes[i]}`;
    }

    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
  },
  numberArrayToCompact(numberArray) {
    return new UInt64(numberArray).compact();
  },
};
