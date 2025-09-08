import httpStatus from 'http-status';

/**
 * @description Get the HTTP status code to output for current request
 *
 * @param method
 * @param hasContent
 */
const getStatusCode = (
  method: string,
  hasContent: boolean
): number | undefined => {
  switch (method) {
    case 'GET':
      return httpStatus.OK;
    case 'POST':
      return hasContent ? httpStatus.CREATED : httpStatus.NO_CONTENT;
    case 'PUT':
    case 'PATCH':
      return hasContent ? httpStatus.OK : httpStatus.NO_CONTENT;
    case 'DELETE':
      return httpStatus.NO_CONTENT;
  }
};

export { getStatusCode };
