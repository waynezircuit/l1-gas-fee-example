const url = "<rpc-url>";
const { ethers } = require("ethers");
const { oracle } = require("./GasPriceOracle.js");

const provider = new ethers.JsonRpcProvider(url);

async function getL1GasFee() {
  try {
    const gasPriceOracle = new ethers.Contract(
      "0x420000000000000000000000000000000000000F",
      oracle.abi,
      provider
    );
    let rawTx = await provider.send("eth_getRawTransactionByHash", [
      "<tx-hash>",
    ]);
    rawTx = rawTx.slice(2).toUpperCase();
    const blockNumber = "<l2-block-number>";
    const l1BaseFee = await gasPriceOracle.l1BaseFee({
      blockTag: blockNumber,
    });
    const baseFeeScalar = await gasPriceOracle.baseFeeScalar({
      blockTag: blockNumber,
    });
    const blobBaseFee = await gasPriceOracle.blobBaseFee({
      blockTag: blockNumber,
    });
    const blobBaseFeeScalar = await gasPriceOracle.blobBaseFeeScalar({
      blockTag: blockNumber,
    });
    const binary = hexTobinary(rawTx);
    // Count zero bytes vs. other bytes
    let zeroBytes = 0;
    let otherBytes = 0;

    // Number of bytes in the binary string
    const numBytes = Math.floor(binary.length / 8);

    for (let i = 0; i < numBytes; i++) {
      // Extract an 8-bit chunk (one byte)
      const byte = binary.substring(i * 8, (i + 1) * 8);
      if (byte === "00000000") {
        zeroBytes++;
      } else {
        otherBytes++;
      }
    }
    const txCompressedSize = (zeroBytes * 4 + otherBytes * 16) / 16;
    const weightedGasPrice =
      BigInt(16) * baseFeeScalar * l1BaseFee + blobBaseFeeScalar * blobBaseFee;
    console.log((txCompressedSize * parseInt(weightedGasPrice)) / 1e6);
  } catch (error) {
    console.error("error:", error);
  }
}

function hexTobinary(hex) {
  let binaryString = "";
  for (let i = 0; i < hex.length; i++) {
    const digit = hex[i];
    switch (digit) {
      case "0":
        binaryString += "0000";
        break;
      case "1":
        binaryString += "0001";
        break;
      case "2":
        binaryString += "0010";
        break;
      case "3":
        binaryString += "0011";
        break;
      case "4":
        binaryString += "0100";
        break;
      case "5":
        binaryString += "0101";
        break;
      case "6":
        binaryString += "0110";
        break;
      case "7":
        binaryString += "0111";
        break;
      case "8":
        binaryString += "1000";
        break;
      case "9":
        binaryString += "1001";
        break;
      case "A":
        binaryString += "1010";
        break;
      case "B":
        binaryString += "1011";
        break;
      case "C":
        binaryString += "1100";
        break;
      case "D":
        binaryString += "1101";
        break;
      case "E":
        binaryString += "1110";
        break;
      case "F":
        binaryString += "1111";
        break;
      default:
        console.error(`Invalid hex digit: ${digit}`);
        process.exit(1);
    }
  }
  return binaryString;
}

async function main() {
  await getL1GasFee();
}

main()
  .catch(console.error)
  .finally(() => process.exit());
