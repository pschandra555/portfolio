// Usage: node scripts/flag-hash.mjs 'FLAG{your_flag}'
// Prints the SHA-256 to paste into lib/ctf.ts, plus the ROT13 and base64 forms.
import { createHash } from "node:crypto";

const flag = process.argv[2];
if (!flag || !/^FLAG\{.+\}$/.test(flag)) {
  console.error("Usage: node scripts/flag-hash.mjs 'FLAG{...}'");
  process.exit(1);
}
const rot13 = flag.replace(/[a-z]/gi, (c) => {
  const b = c <= "Z" ? 65 : 97;
  return String.fromCharCode(((c.charCodeAt(0) - b + 13) % 26) + b);
});
console.log("sha256:", createHash("sha256").update(flag).digest("hex"));
console.log("rot13: ", rot13);
console.log("base64:", Buffer.from(flag).toString("base64"));
