import { clone } from 'lodash';

import { IMedia, IMediaRequest, IResponse } from '@interfaces';
import { Safe } from '@decorators/safe.decorator';
import { MediaRepository } from '@repositories/media.repository';
import { Media } from '@prisma/client';

import { paginate } from '@utils/pagination.util';

/**
 * Manage incoming requests for api/{version}/medias
 */
class MediaController {
  /**
   * @description
   */
  private static instance: MediaController;

  private constructor() {}

  /**
   * @description
   */
  static get(): MediaController {
    if (!MediaController.instance) {
      MediaController.instance = new MediaController();
    }
    return MediaController.instance;
  }

  /**
   * @description Retrieve one document according to :documentId
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   *
   * @public
   */
  @Safe()
  async get(req: IMediaRequest, res: IResponse): Promise<void> {
    const repository = MediaRepository;
    const media = await repository.findOneOrFail({
      where: { id: req.params.mediaId },
      relations: ['owner'],
    });
    res.locals.data = media;
  }

  /**
   * @description Retrieve a list of documents, according to some parameters
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  @Safe()
  async list(req: IMediaRequest, res: IResponse): Promise<void> {
    const response = await MediaRepository.list(req.query);
    res.locals.data = response.result;
    res.locals.meta = {
      total: response.total,
      pagination: paginate(parseInt(req.query.page, 10), parseInt(req.query.perPage, 10), response.total),
    };
  }

  /**
   * @description Create a new document
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   *
   * @public
   */
  @Safe()
  async create(req: IMediaRequest, res: IResponse): Promise<void> {
    const repository = MediaRepository;
    const files = Array.isArray(req.files) ? req.files : [req.files];
    const medias: Record<string, any>[] = files.map((file: any) => ({
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      destination: file.destination,
      filename: file.filename,
      path: file.path,
      size: file.size,
      ownerId: req.user?.id || undefined,
    }));
    const result = await repository.createMany(medias as Media[]);
    res.locals.data = result;
  }

  /**
   * @description Update one document according to :documentId
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   *
   * @public
   */
  @Safe()
  async update(req: IMediaRequest, res: IResponse): Promise<void> {
    const repository = MediaRepository;
    const media = clone(res.locals.data) as Media;
    if (!req.files || req.files.length === 0) {
      throw new Error('No files provided for update');
    }
    Object.assign(media, req.files[0] as IMedia);
    // await repository.update(media.id, media as Media);/
    res.locals.data = media;
  }

  /**
   * @description Delete one document according to :documentId
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   *
   * @public
   */
  @Safe()
  async remove(req: IMediaRequest, res: IResponse): Promise<void> {
    const repository = MediaRepository;
    const media = clone(res.locals.data) as Media;
    await repository.remove(media.id);
  }
}

const mediaController = MediaController.get();

export { mediaController as MediaController };
