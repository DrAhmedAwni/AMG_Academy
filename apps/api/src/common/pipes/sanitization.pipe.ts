import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { Buffer } from 'buffer';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    if (!metadata.type || value === null || value === undefined) {
      return value;
    }

    return this.sanitizeDeep(value);
  }

  private sanitizeDeep(value: unknown): unknown {
    if (Buffer.isBuffer(value) || value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeDeep(item));
    }

    if (value instanceof Date || typeof value !== 'object' || value === null) {
      return typeof value === 'string' ? this.sanitizeString(value) : value;
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, this.sanitizeDeep(entry)]),
    );
  }

  private sanitizeString(value: string) {
    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'discard',
      allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    }).trim();
  }
}
