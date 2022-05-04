import * as S3 from 'aws-sdk/clients/s3';
import DataUpdaterInterface from '../DataUpdaterInterface';
import S3ConfigurationInterface from '../Util/S3/S3ConfigurationInterface';

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
      apiVersion: 'latest',
      endpoint: this.s3Config.endpoint,
      credentials: {
        accessKeyId: this.s3Config.accessKey,
        secretAccessKey: this.s3Config.secretKey,
      },
    });
  }

  public async updateToken(tokenId: number, isRevealed: boolean): Promise<void> {
    if (isRevealed) {
      await this.revealToken(tokenId);

      return;
    }

    await this.hideToken(tokenId);
  }

  protected async revealToken(tokenId: number): Promise<void> {
    if (await this.destinationDataExists(tokenId)) {
      console.log(`Skipping "${this.resourceName}" for token ${tokenId} (already revealed)...`);

      return;
    }

    console.log(`Revealing "${this.resourceName}" for token ${tokenId}...`);

    try {
      await this.s3.copyObject({
        Bucket: this.s3Config.bucketName,
        CopySource: `${this.s3Config.bucketName}/${this.buildSourceObjectKey(tokenId)}`,
        Key: this.buildDestinationObjectKey(tokenId),
        ACL: 'public-read',
      }).promise();
    } catch (error) {
      console.error(`Error copying "${this.resourceName}" for token ${tokenId}.`);
      console.error(error);
    }
  }

  protected async hideToken(tokenId: number): Promise<void> {
    if (!await this.destinationDataExists(tokenId)) {
      console.log(`Skipping "${this.resourceName}" for token ${tokenId} (already hidden)...`);

      return;
    }

    console.log(`Hiding "${this.resourceName}" for token ${tokenId}...`);

    try {
      await this.s3.deleteObject({
        Bucket: this.s3Config.bucketName,
        Key: this.buildDestinationObjectKey(tokenId),
      }).promise();
    } catch (error) {
      console.error(`Error deleting "${this.resourceName}" for token ${tokenId}.`);
      console.error(error);
    }
  }

  protected buildSourceObjectKey(tokenId: number): string {
    return this.buildObjectKey(tokenId, this.sourcePath);
  }

  protected buildDestinationObjectKey(tokenId: number): string {
    return this.buildObjectKey(tokenId, this.destinationPath);
  }

  protected buildObjectKey(tokenId: number, path: string): string {
    return `${this.s3Config.pathPrefix}/${path}/${tokenId}${this.fileExtension}`.replace('//', '/');
  }

  protected async destinationDataExists(tokenId: number): Promise<boolean> {
    try {
      await this.s3.headObject({
        Bucket: this.s3Config.bucketName,
        Key: this.buildDestinationObjectKey(tokenId),
      }).promise();

      return true;
    } catch (error) {
      if (error.name !== 'NotFound') {
        console.error(`Error checking "${this.resourceName}" existence for token ${tokenId}.`);
        console.error(error);
      }
    }

    return false;
  }
}
