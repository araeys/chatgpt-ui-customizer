(() => {
  if (globalThis.RayZip) return;

  const encoder = new TextEncoder();
  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function toBytes(data) {
    if (data instanceof Uint8Array) return data;
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    return encoder.encode(String(data));
  }

  function dosDateTime(date = new Date()) {
    const year = Math.max(1980, date.getFullYear());
    const dosTime = ((date.getHours() & 31) << 11) | ((date.getMinutes() & 63) << 5) | ((Math.floor(date.getSeconds() / 2)) & 31);
    const dosDate = (((year - 1980) & 127) << 9) | (((date.getMonth() + 1) & 15) << 5) | (date.getDate() & 31);
    return { dosTime, dosDate };
  }

  function u16(n) {
    const b = new Uint8Array(2);
    new DataView(b.buffer).setUint16(0, n, true);
    return b;
  }

  function u32(n) {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setUint32(0, n >>> 0, true);
    return b;
  }

  function concat(parts) {
    let total = 0;
    for (const p of parts) total += p.length;
    const out = new Uint8Array(total);
    let off = 0;
    for (const p of parts) {
      out.set(p, off);
      off += p.length;
    }
    return out;
  }

  function buildZip(files) {
    const locals = [];
    const centrals = [];
    let offset = 0;
    const { dosTime, dosDate } = dosDateTime();

    for (const file of files) {
      const nameBytes = encoder.encode(file.name.replace(/\\/g, '/'));
      const data = toBytes(file.data);
      const crc = crc32(data);
      const flags = 0x0800;
      const method = 0;

      const localHeader = concat([
        u32(0x04034B50),
        u16(20),
        u16(flags),
        u16(method),
        u16(dosTime),
        u16(dosDate),
        u32(crc),
        u32(data.length),
        u32(data.length),
        u16(nameBytes.length),
        u16(0),
        nameBytes
      ]);
      locals.push(localHeader, data);

      const centralHeader = concat([
        u32(0x02014B50),
        u16(20),
        u16(20),
        u16(flags),
        u16(method),
        u16(dosTime),
        u16(dosDate),
        u32(crc),
        u32(data.length),
        u32(data.length),
        u16(nameBytes.length),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(0),
        u32(offset),
        nameBytes
      ]);
      centrals.push(centralHeader);
      offset += localHeader.length + data.length;
    }

    const centralSize = centrals.reduce((n, x) => n + x.length, 0);
    const end = concat([
      u32(0x06054B50),
      u16(0),
      u16(0),
      u16(files.length),
      u16(files.length),
      u32(centralSize),
      u32(offset),
      u16(0)
    ]);

    return concat([...locals, ...centrals, end]);
  }

  globalThis.RayZip = { buildZip };
})();
