import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/** Metadados reais de um objeto no storage. */
export interface ObjectStat {
  size: number;
  contentType: string;
}

/**
 * Encapsula o storage S3-compatível (MinIO local, R2/S3 em produção).
 * Os binários nunca passam pela API: o cliente sobe/baixa por URLs assinadas.
 */
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly expiresIn: number;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('STORAGE_BUCKET', 'daily-hub-attachments');
    this.expiresIn = Number(this.config.get<string>('STORAGE_PRESIGNED_EXPIRES_IN', '3600'));
    this.client = new S3Client({
      endpoint: this.config.get<string>('STORAGE_ENDPOINT', 'http://localhost:9000'),
      region: this.config.get<string>('STORAGE_REGION', 'us-east-1'),
      // MinIO exige path-style (bucket no path, não no host).
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.config.get<string>('STORAGE_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: this.config.get<string>('STORAGE_SECRET_KEY', 'minioadmin'),
      },
    });
  }

  /** Garante que o bucket exista ao subir a aplicação. */
  async onModuleInit(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`Bucket "${this.bucket}" criado.`);
      } catch (err) {
        this.logger.warn(`Não foi possível garantir o bucket "${this.bucket}": ${String(err)}`);
      }
    }
  }

  /** URL assinada para o cliente enviar o arquivo (PUT) direto ao storage. */
  presignPut(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn: this.expiresIn });
  }

  /** URL assinada para baixar/visualizar o arquivo (GET). */
  presignGet(key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: this.expiresIn });
  }

  /** Confirma a existência do objeto e devolve seus metadados reais (ou null). */
  async stat(key: string): Promise<ObjectStat | null> {
    try {
      const head = await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return {
        size: head.ContentLength ?? 0,
        contentType: head.ContentType ?? 'application/octet-stream',
      };
    } catch {
      return null;
    }
  }

  /** Remove o objeto do storage. */
  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
