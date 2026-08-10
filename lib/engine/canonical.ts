function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, normalize(nested)]),
    );
  }
  return value;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(normalize(value));
}

// Compact SHA-256 implementation used in both browsers and Node. It keeps the
// public receipt path dependency-free and is checked against a known vector.
export function sha256(input: string): string {
  const rightRotate = (value: number, amount: number) =>
    (value >>> amount) | (value << (32 - amount));
  const maxWord = 2 ** 32;
  const words: number[] = [];
  const hash: number[] = [];
  const constants: number[] = [];
  const composite: Record<number, boolean> = {};
  let primeCounter = 0;

  for (let candidate = 2; primeCounter < 64; candidate += 1) {
    if (!composite[candidate]) {
      for (let multiple = candidate * candidate; multiple < 313; multiple += candidate) {
        composite[multiple] = true;
      }
      if (primeCounter < 8) hash[primeCounter] = (candidate ** 0.5 * maxWord) | 0;
      constants[primeCounter] = (candidate ** (1 / 3) * maxWord) | 0;
      primeCounter += 1;
    }
  }

  const bytes = new TextEncoder().encode(input);
  const bitLength = bytes.length * 8;
  const padded = Array.from(bytes);
  padded.push(0x80);
  while ((padded.length % 64) !== 56) padded.push(0);
  const high = Math.floor(bitLength / maxWord);
  const low = bitLength >>> 0;
  for (let shift = 24; shift >= 0; shift -= 8) padded.push((high >>> shift) & 0xff);
  for (let shift = 24; shift >= 0; shift -= 8) padded.push((low >>> shift) & 0xff);

  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      const start = offset + index * 4;
      words[index] =
        (padded[start] << 24) |
        (padded[start + 1] << 16) |
        (padded[start + 2] << 8) |
        padded[start + 3];
    }
    for (let index = 16; index < 64; index += 1) {
      const prior = words[index - 15];
      const recent = words[index - 2];
      const sigma0 = rightRotate(prior, 7) ^ rightRotate(prior, 18) ^ (prior >>> 3);
      const sigma1 = rightRotate(recent, 17) ^ rightRotate(recent, 19) ^ (recent >>> 10);
      words[index] = (words[index - 16] + sigma0 + words[index - 7] + sigma1) | 0;
    }

    const working = hash.slice(0, 8);
    for (let index = 0; index < 64; index += 1) {
      const sum1 = rightRotate(working[4], 6) ^ rightRotate(working[4], 11) ^ rightRotate(working[4], 25);
      const choose = (working[4] & working[5]) ^ (~working[4] & working[6]);
      const temp1 = (working[7] + sum1 + choose + constants[index] + words[index]) | 0;
      const sum0 = rightRotate(working[0], 2) ^ rightRotate(working[0], 13) ^ rightRotate(working[0], 22);
      const majority =
        (working[0] & working[1]) ^
        (working[0] & working[2]) ^
        (working[1] & working[2]);
      const temp2 = (sum0 + majority) | 0;
      working.unshift((temp1 + temp2) | 0);
      working[4] = (working[4] + temp1) | 0;
      working.pop();
    }
    for (let index = 0; index < 8; index += 1) hash[index] = (hash[index] + working[index]) | 0;
  }

  return hash.map((value) => (value >>> 0).toString(16).padStart(8, "0")).join("");
}

export function digest(value: unknown): string {
  return sha256(canonicalJson(value));
}
