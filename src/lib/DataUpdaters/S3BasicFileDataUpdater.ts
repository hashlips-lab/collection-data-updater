import * as S3 from "aws-sdk/clients/s3";
import { BigNumber } from "ethers";
import { isRevealed as checkIsRevealed } from "../CollectionStatusProviders/ERC721CollectionStatusProvider";
import DataUpdaterInterface from "../DataUpdaterInterface";
import EventDataInterface from "../EventDataInterface";
import S3ConfigurationInterface from "../Util/S3/S3ConfigurationInterface";

export default class S3BasicFileDataUpdater implements DataUpdaterInterface {
  protected s3: S3;

  public constructor(
    protected resourceName: string,
    protected s3Config: S3ConfigurationInterface,
    protected sourcePath: string,
    protected destinationPath: string,
    protected fileExtension: string,
  ) {
    this.s3 = new S3({
      apiVersion: "latest",
      endpoint: this.s3Config.endpoint,
      credentials: {
        accessKeyId: this.s3Config.accessKey,
        secretAccessKey: this.s3Config.secretKey,
      },
    });
  }

  public async updateToken(eventData: EventDataInterface): Promise<EventDataInterface> {
    const isRevealed = checkIsRevealed(eventData);

    if (isRevealed === undefined) {
      console.log(`Skipping "${this.resourceName}" for token ${eventData.tokenId.toString()} (token status is undefined)...`);

      return eventData;
    }

    if (isRevealed) {
      await this.revealToken(eventData.tokenId);

      return eventData;
    }

    await this.hideToken(eventData.tokenId);

    return eventData;
  }

  protected async revealToken(tokenId: BigNumber): Promise<void> {
    if (await this.destinationDataExists(tokenId)) {
      console.log(`Skipping "${this.resourceName}" for token ${tokenId.toString()} (already revealed)...`);

      return;
    }

    console.log(`Revealing "${this.resourceName}" for token ${tokenId.toString()}...`);

    const sourceKey = this.sanitizeKey(`${this.s3Config.bucketName}/${this.buildSourceObjectKey(tokenId)}`);
    const destinationKey = this.buildDestinationObjectKey(tokenId);

    try {
      await this.s3.copyObject({
        Bucket: this.s3Config.bucketName,
        CopySource: sourceKey,
        Key: destinationKey,
        ACL: "public-read",
      }).promise();
    } catch (error) {
      console.error(`Error copying "${this.resourceName}" for token ${tokenId.toString()}.`);
      console.error(`Source key: ${sourceKey}`);
      console.error(`Destination key: ${destinationKey}`);
      console.error(error);
    }
  }

  protected async hideToken(tokenId: BigNumber): Promise<void> {
    if (!await this.destinationDataExists(tokenId)) {
      console.log(`Skipping "${this.resourceName}" for token ${tokenId.toString()} (already hidden)...`);

      return;
    }

    console.log(`Hiding "${this.resourceName}" for token ${tokenId.toString()}...`);

    const objectKey = this.buildDestinationObjectKey(tokenId);

    try {
      await this.s3.deleteObject({
        Bucket: this.s3Config.bucketName,
        Key: objectKey,
      }).promise();
    } catch (error) {
      console.error(`Error deleting "${this.resourceName}" for token ${tokenId.toString()}.`);
      console.error(`Object key: ${objectKey}`);
      console.error(error);
    }
  }

  protected buildSourceObjectKey(tokenId: BigNumber): string {
    return this.buildObjectKey(tokenId, this.sourcePath);
  }

  protected buildDestinationObjectKey(tokenId: BigNumber): string {
    return this.buildObjectKey(tokenId, this.destinationPath);
  }

  protected buildObjectKey(tokenId: BigNumber, path: string): string {
    return this.sanitizeKey(`${this.s3Config.pathPrefix}/${path}/${tokenId.toString()}${this.fileExtension}`);
  }

  protected async destinationDataExists(tokenId: BigNumber): Promise<boolean> {
    const objectKey = this.buildDestinationObjectKey(tokenId);

    try {
      await this.s3.headObject({
        Bucket: this.s3Config.bucketName,
        Key: objectKey,
      }).promise();

      return true;
    } catch (error) {
      if (error.name !== "NotFound") {
        console.error(`Error checking "${this.resourceName}" existence for token ${tokenId.toString()}.`);
        console.error(`Object key: ${objectKey}`);
        console.error(error);
      }
    }

    return false;
  }

  protected sanitizeKey(value: string): string {
    // Remove leading and double "/" or keys won't be valid.

    return value.replaceAll(/[\/]+/g, "/").replace(/^\//, "");
  }
}
