import { PrismaClient, Media, MimeType as Mime_Type } from '@prisma/client';
import { omitBy, isNil } from 'lodash';
import { IMediaQueryString } from '@interfaces';
import { getMimeTypesOfType } from '@utils/string.util';
import { MimeTypeMapReverse } from '@utils/mapMimeType.util';
import { Prisma } from '@services/prisma.service';
import { badImplementation } from '@hapi/boom';
import { MimeType } from '@types';

class MediaRepository {
  private prisma = Prisma.client;

  constructor() {}
  async createMany(medias: Omit<Media, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Media[]> {
    try {
      if (!medias.length) return [];

      const data = medias.map((item) => ({
        fieldname: item.fieldname,
        filename: item.filename,
        path: item.path,
        mimetype: MimeTypeMapReverse[item.mimetype as MimeType] as Mime_Type,
        size: item.size,
        ownerId: item.ownerId ?? null,
        caseId: item.caseId ?? null,
        deletedAt: item.deletedAt ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const res = await this.prisma.media.createMany({ data, skipDuplicates: true });
      const filenames = medias.map((m) => m.filename);
      const createdMedias = await this.prisma.media.findMany({
        where: {
          filename: { in: filenames },
        },
      });
      return createdMedias;
    } catch (e: any) {
      throw badImplementation(`Error creating multiple media records: ${e.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    await this.prisma.media.delete({ where: { id } });
  }

  async findOneOrFail(options: { where: { id: string }; relations?: string[] }): Promise<Media> {
    const media = await this.prisma.media.findUniqueOrThrow({
      where: options.where,
      include:
        options.relations?.reduce(
          (acc, relation) => {
            acc[relation] = true;
            return acc;
          },
          {} as Record<string, boolean>
        ) || {},
    });
    return media;
  }

  async create(media: Media): Promise<Media> {
    return await this.prisma.media.create({ data: media });
  }

  async update(media: Media): Promise<Media> {
    return await this.prisma.media.update({
      where: { id: media.id },
      data: media,
    });
  }

  async list({
    page = 1,
    perPage = 30,
    path,
    fieldname,
    filename,
    size,
    mimetype,
    owner,
    type,
  }: IMediaQueryString): Promise<{ result: Media[]; total: number }> {
    const options = omitBy({ path, fieldname, filename, size, mimetype, owner, type }, isNil) as IMediaQueryString;

    const where: Record<string, any> = {
      ...(options.fieldname && { fieldname: options.fieldname }),
      ...(options.filename && { filename: { contains: options.filename } }),
      ...(options.mimetype && { mimetype: { contains: options.mimetype } }),
      ...(options.type && {
        mimetype: { in: getMimeTypesOfType(options.type) },
      }),
      ...(options.size && { size: { gte: Number(options.size) } }),
      ...(options.path && { path: options.path }),
      ...(options.owner && { ownerId: Number(options.owner) }), // Assuming owner is ID
    };

    page = parseInt(page as string, 10);
    perPage = parseInt(perPage as string, 10);

    const [result, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          owner: true,
        },
      }),
      this.prisma.media.count({ where }),
    ]);

    return { result, total };
  }
}

const mediaRepository = new MediaRepository();

export { mediaRepository as MediaRepository };
