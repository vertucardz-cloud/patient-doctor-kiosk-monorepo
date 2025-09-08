import { Jimp } from 'jimp';
import { unlink, existsSync } from 'fs';
import { promisify } from 'util';
import { expectationFailed } from '@hapi/boom';
import { SCALING } from '@config/environment.config';
import { Prisma } from '@services/prisma.service';
import { IMAGE_MIME_TYPE } from '@enums';
import { EnvImageScaling } from '@types';

class MediaService {
  private static instance: MediaService;
  private readonly OPTIONS: EnvImageScaling;
  private readonly SIZES: string[];
  private prisma = Prisma.client;

  private constructor(config: EnvImageScaling) {
    this.OPTIONS = config;
    this.SIZES = Object.keys(this.OPTIONS.SIZES).map((key) => key.toLowerCase());
  }

  static get(config: EnvImageScaling): MediaService {
    if (!MediaService.instance) {
      MediaService.instance = new MediaService(config);
    }
    return MediaService.instance;
  }

  async rescale(mediaId: string): Promise<void> {
    if (!this.OPTIONS.IS_ACTIVE) return;

    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });
    if (!media) throw expectationFailed('Media not found');

    try {
      const image = await Jimp.read(media.path);

      await Promise.all(
        this.SIZES.map(async (size) => {
          const sizeKey = size.toUpperCase() as keyof typeof this.OPTIONS.SIZES;
          const width = this.OPTIONS.SIZES[sizeKey];
          const scaledPath = `${media.path
            .split('/')
            .slice(0, -1)
            .join('/')
            .replace(this.OPTIONS.PATH_MASTER, this.OPTIONS.PATH_SCALE)}/${size}/${media.filename}.jpg`;

          // await image.clone().resize({ w: width })?.writeAsync(scaledPath);
          const clonedImage = image.clone().resize({ w: width });
          await (clonedImage as any).writeAsync(scaledPath);
        })
      );
    } catch (error) {
      console.error('Error processing image:', error);
    }
  }

  async remove(mediaId: string): Promise<void> {
    const unlinkAsync = promisify(unlink);
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });
    if (!media) return;

    try {
      if (!Object.values(IMAGE_MIME_TYPE).includes(media.mimetype as IMAGE_MIME_TYPE) && existsSync(media.path)) {
        await unlinkAsync(media.path);
      } else {
        const paths = this.SIZES.map((size) =>
          media.path.replace(
            `${this.OPTIONS.PATH_MASTER}/${media.fieldname}`,
            `${this.OPTIONS.PATH_SCALE}/${media.fieldname}/${size}`
          )
        ).filter((path) => existsSync(path));

        await Promise.all([
          existsSync(media.path) ? unlinkAsync(media.path) : Promise.resolve(),
          ...paths.map((path) => unlinkAsync(path)),
        ]);
      }

      await this.prisma.media.delete({ where: { id: mediaId } });
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  }
}

const mediaService = MediaService.get(SCALING);
export { mediaService as MediaService };
