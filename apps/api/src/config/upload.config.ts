import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage, Options } from 'multer';
import { randomUUID } from 'crypto';

const ensureDirectory = (directory: string) => {
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
};

export const createUploadOptions = (subdirectory: string): Options => {
  const baseDir = process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads');
  const targetDir = join(baseDir, subdirectory);
  ensureDirectory(targetDir);

  return {
    storage: diskStorage({
      destination: (_request, _file, callback) => {
        callback(null, targetDir);
      },
      filename: (_request, file, callback) => {
        callback(null, `${randomUUID()}${extname(file.originalname)}`);
      },
    }),
  };
};
