import * as Util from 'util';
import Pluralize from 'pluralize';
import { IModel } from '@interfaces';
import { isObject } from '@utils/object.util';

type SanitizableData =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean;

class SanitizeService {
  /**
   * @description
   */
  private static instance: SanitizeService;

  private constructor() {}

  /**
   * @description
   */
  static get(): SanitizeService {
    if (!SanitizeService.instance) {
      SanitizeService.instance = new SanitizeService();
    }
    return SanitizeService.instance;
  }

  /**
   * @description
   *
   * @param data
   */
  // hasEligibleMember(data: unknown): boolean {
  //   return (
  //     (this.implementsWhitelist(data) && !Array.isArray(data)) ||
  //     (Array.isArray(data) && data.some(obj => this.implementsWhitelist(obj))) ||
  //     (isObject(data) && Object.keys(data).some(key => this.implementsWhitelist((data as Record<string, unknown>)[key]))
  //   );
  // }

  /**
   * @description
   *
   * @param data
   */
  // process(data: unknown): unknown {
  //   if (Array.isArray(data)) {
  //     return data.map((d: unknown) =>
  //       this.implementsWhitelist(d) ? this.sanitize(d as IModel) : d
  //     );
  //   }

  //   if (this.implementsWhitelist(data)) {
  //     return this.sanitize(data as IModel);
  //   }

  //   if (isObject(data)) {
  //     return Object.keys(data).reduce((acc: Record<string, unknown>, current: string) => {
  //       const currentData = (data as Record<string, unknown>)[current];
  //       acc[current] = this.implementsWhitelist(currentData)
  //         ? this.sanitize(currentData as IModel)
  //         : currentData;
  //       return acc;
  //     }, {});
  //   }

  //   return data;
  // }

  // /**
  //  * @description Whitelist an entity
  //  *
  //  * @param entity Entity to sanitize
  //  */
  // private sanitize(entity: IModel): Record<string, unknown> {
  //   const output: Record<string, unknown> = {};
  //   Object.keys(entity).forEach((key: string) => {
  //     if (entity.whitelist.includes(key) || entity.whitelist.includes(Pluralize(key))) {
  //       const value = entity[key as keyof typeof entity];
  //       output[key] = this.isSanitizable(value)
  //         ? Array.isArray(value)
  //           ? value.length > 0
  //             ? value.map(e => this.sanitize(e as IModel))
  //             : []
  //           : this.sanitize(value as IModel)
  //         : value;
  //     }
  //   });
  //   return output;
  // }

  // /**
  //  * @description
  //  *
  //  * @param obj
  //  */
  // private implementsWhitelist(obj: unknown): obj is IModel {
  //   return isObject(obj) && 'whitelist' in obj;
  // }

  // /**
  //  * @description Say if a value can be sanitized
  //  *
  //  * @param value Value to check as sanitizable
  //  */
  // private isSanitizable(value: unknown): value is IModel | IModel[] {
  //   if (!value) {
  //     return false;
  //   }

  //   if (Util.types.isDate(value) ||
  //       typeof value === 'string' ||
  //       typeof value === 'number' ||
  //       typeof value === 'boolean') {
  //     return false;
  //   }

  //   if (isObject(value) && value.constructor === Object) {
  //     return false;
  //   }

  //   if (Array.isArray(value) &&
  //       value.some(v => typeof v === 'string' || (isObject(v) && v.constructor === Object))) {
  //     return false;
  //   }

  //   return true;
  // }
}

const sanitizeService = SanitizeService.get();

export { sanitizeService as SanitizeService };
