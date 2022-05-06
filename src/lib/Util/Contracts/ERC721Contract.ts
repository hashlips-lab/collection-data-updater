import { Contract } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

export default class ERC721Contract extends Contract {
    constructor (address: string, providerOrRpcUrl: JsonRpcProvider|string) {
      const provider = (typeof providerOrRpcUrl === "string") ? new JsonRpcProvider(providerOrRpcUrl) : providerOrRpcUrl;

      super(
        address,
        [
          "function maxSupply() public view returns (uint256)",
          "function totalSupply() public view returns (uint256)",
          "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
        ],
        provider,
      );
  }
}
