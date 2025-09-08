import { list } from '@utils/enum.util';
import {
  AUDIO_MIME_TYPE,
  ARCHIVE_MIME_TYPE,
  DOCUMENT_MIME_TYPE,
  IMAGE_MIME_TYPE,
  VIDEO_MIME_TYPE,
} from '@enums';

/**
 * @description Shortcut all media types mime-types as pseudo enum
 */
const MIME_TYPE = {
  ...AUDIO_MIME_TYPE,
  ...ARCHIVE_MIME_TYPE,
  ...DOCUMENT_MIME_TYPE,
  ...IMAGE_MIME_TYPE,
  ...VIDEO_MIME_TYPE,
};

/**
 * @description Shortcut all media types mime-types as flat list
 */
const MIME_TYPE_LIST: string[] = [
  ...list(AUDIO_MIME_TYPE),
  ...list(ARCHIVE_MIME_TYPE),
  ...list(DOCUMENT_MIME_TYPE),
  ...list(IMAGE_MIME_TYPE),
  ...list(VIDEO_MIME_TYPE),
];

export { MIME_TYPE, MIME_TYPE_LIST };
