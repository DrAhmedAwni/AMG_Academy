import { SanitizationPipe } from './sanitization.pipe';

describe('SanitizationPipe', () => {
  const pipe = new SanitizationPipe();

  it('sanitizes nested string values', () => {
    const result = pipe.transform(
      { title: '<script>alert(1)</script>Clean', nested: { value: '<b>Bold</b>' } },
      { type: 'body' },
    ) as { title: string; nested: { value: string } };

    expect(result.title).toBe('Clean');
    expect(result.nested.value).toBe('Bold');
  });

  it('preserves upload buffers while sanitizing multipart file metadata', () => {
    const buffer = Buffer.from('video-bytes');
    const result = pipe.transform(
      {
        originalname: '<b>lesson.mp4</b>',
        mimetype: 'video/mp4',
        buffer,
      },
      { type: 'custom' },
    ) as { originalname: string; mimetype: string; buffer: Buffer };

    expect(result.originalname).toBe('lesson.mp4');
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.buffer).toBe(buffer);
  });
});
