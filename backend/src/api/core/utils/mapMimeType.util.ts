import { Fieldname, MimeType } from '@types';

const mapMimeType = (mime: string): string | undefined => {
  switch (mime.toLowerCase()) {
    case 'image/jpeg':
      return 'IMAGE_JPEG';
    case 'image/png':
      return 'IMAGE_PNG';
    case 'image/gif':
      return 'IMAGE_GIF';
    case 'image/bmp':
      return 'IMAGE_BMP';
    case 'image/gif':
      return 'IMAGE_GIF';
    case 'image/jpg':
      return 'IMAGE_JPEG';
    default:
      return undefined;
  }
};

const MimeTypeMapReverse: Record<MimeType, string> = {
  // Video
  'video/mp4': 'VIDEO_MP4',
  'application/x-mpegURL': 'APPLICATION_X_MPEGURL',
  'video/3gpp': 'VIDEO_3GPP',
  'video/quicktime': 'VIDEO_QUICKTIME',
  'video/x-msvideo': 'VIDEO_X_MSVIDEO',
  'video/x-ms-wmv': 'VIDEO_X_MS_WMV',

  // Image
  'image/bmp': 'IMAGE_BMP',
  'image/gif': 'IMAGE_GIF',
  'image/jpg': 'IMAGE_JPG',
  'image/jpeg': 'IMAGE_JPEG',
  'image/png': 'IMAGE_PNG',

  // Document
  'application/vnd.ms-excel': 'APPLICATION_VND_MS_EXCEL',
  'application/vnd.ms-powerpoint': 'APPLICATION_VND_MS_POWERPOINT',
  'application/msword': 'APPLICATION_MSWORD',
  'application/pdf': 'APPLICATION_PDF',
  'application/vnd.oasis.opendocument.presentation': 'APPLICATION_VND_OASIS_ODP',
  'application/vnd.oasis.opendocument.spreadsheet': 'APPLICATION_VND_OASIS_ODS',
  'application/vnd.oasis.opendocument.text': 'APPLICATION_VND_OASIS_ODT',
  'text/csv': 'TEXT_CSV',

  // Audio
  'audio/mpeg': 'AUDIO_MPEG',
  'audio/mp3': 'AUDIO_MP3',
  'audio/mid': 'AUDIO_MID',
  'audio/mp4': 'AUDIO_MP4',
  'audio/x-aiff': 'AUDIO_X_AIFF',
  'audio/ogg': 'AUDIO_OGG',
  'audio/vorbis': 'AUDIO_VORBIS',
  'audio/vnd.wav': 'AUDIO_VND_WAV',

  // Archive
  'application/x-7z-compressed': 'APPLICATION_X_7Z',
  'application/x-rar-compressed': 'APPLICATION_X_RAR',
  'application/x-tar': 'APPLICATION_X_TAR',
  'application/zip': 'APPLICATION_ZIP',
};

export { mapMimeType, MimeTypeMapReverse };
