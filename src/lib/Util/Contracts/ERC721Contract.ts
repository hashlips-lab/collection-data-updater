import { Contract } from "ethers";
import { StaticJsonRpcProvider, Provider } from "@ethersproject/providers";

export default class ERC721Contract extends Contract {
    constructor (address: string, providerOrRpcUrl: Provider|string) {
      const provider: Provider = (typeof providerOrRpcUrl === "string") ? new StaticJsonRpcProvider(providerOrRpcUrl) : providerOrRpcUrl;

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
