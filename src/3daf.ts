async function decryptWsmAsync(buf: ArrayBuffer) {
  const rawKey = new ArrayBuffer(16),
    u81 = new Uint8Array(rawKey, 0, 8),
    u82 = new Uint8Array(rawKey, 8, 8);

  u81.set(new Uint8Array(buf.slice(8, 16)));
  u82.set(new Uint8Array(buf.slice(0, 8)));

  u81.forEach((t, i) => {
    u81[i] = 114514 ^ t;
  });
  u82.forEach((t, i) => {
    u82[i] = 114514 ^ t;
  });

  const algorithm = 'AES-CBC';

  return (
    await crypto.subtle.decrypt(
      { name: algorithm, iv: new ArrayBuffer(16) },
      await crypto.subtle.importKey('raw', rawKey, algorithm, true, [
        'encrypt',
        'decrypt',
      ]),
      buf
    )
  ).slice(32);
}

async function loadLive2dWsmAsync(buf: ArrayBuffer, encoding?: string) {
  if (buf instanceof ArrayBuffer) {
    return new WsmInstance(await decryptWsmAsync(buf), encoding);
  } else {
    throw new TypeError('First argument must be an ArrayBuffer.');
  }
}

class WsmFile {
  name: string;
  data: ArrayBuffer;

  constructor(name: string, data: ArrayBuffer) {
    this.name = name;
    this.data = data;
  }

  toString() {
    return new TextDecoder().decode(this.data);
  }
}

class WsmInstance {
  files: Map<string, WsmFile>;

  constructor(buf: ArrayBuffer, encoding?: string) {
    this.files = new Map();

    let i = 0;
    while (i < buf.byteLength) {
      const { total, name, data } = WsmDecoder(
        buf.slice(i),
        encoding || 'utf-8'
      );
      this.files.set(name, new WsmFile(name, data));
      i += total;
    }
  }

  read(name: string) {
    for (const file of this.files.values()) {
      if (file.name.includes(name) && !file.name.startsWith('__MACOSX')) {
        return file;
      }
    }
  }

  findOne(matcher: (name: string) => boolean) {
    for (const file of this.files.values()) {
      if (matcher(file.name)) {
        return file;
      }
    }
  }

  findAll(matcher: (name: string) => boolean) {
    return Array.from(this.files.values()).filter((file) => matcher(file.name));
  }
}

function WsmDecoder(buf: ArrayBuffer, encoding: string) {
  let total = 0;

  const dataView = new DataView(buf);
  const i = dataView.getUint32(total, true);
  total += Uint32Array.BYTES_PER_ELEMENT;

  const name = new TextDecoder(encoding).decode(buf.slice(total, total + i));
  total += i;

  const s = dataView.getUint32(total, true);
  total += Uint32Array.BYTES_PER_ELEMENT;

  const data = dataView.buffer.slice(total, total + s);
  total += s;

  return { total, name, data };
}

export { WsmFile, WsmInstance, loadLive2dWsmAsync };
