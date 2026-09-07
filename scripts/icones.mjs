// Génère les icônes de l'application (fond rose, cœur crème) sans dépendance.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const FOND = [201, 111, 139];   // rose
const COEUR = [253, 248, 244];  // crème

function crc32(buffer) {
  let c = ~0;
  for (const octet of buffer) {
    c ^= octet;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function morceau(type, donnees) {
  const longueur = Buffer.alloc(4);
  longueur.writeUInt32BE(donnees.length);
  const corps = Buffer.concat([Buffer.from(type, "ascii"), donnees]);
  const controle = Buffer.alloc(4);
  controle.writeUInt32BE(crc32(corps));
  return Buffer.concat([longueur, corps, controle]);
}

/** Le cœur : ((x²+y²−1)³ − x²y³ ≤ 0). */
function dansLeCoeur(x, y) {
  const a = x * x + y * y - 1;
  return a * a * a - x * x * y * y * y <= 0;
}

function icone(taille) {
  const lignes = [];
  const rayon = taille * 0.22;

  for (let py = 0; py < taille; py++) {
    const ligne = [0]; // filtre « aucun »

    for (let px = 0; px < taille; px++) {
      // Coin arrondi : en dehors, on laisse transparent.
      const dx = Math.max(rayon - px, px - (taille - rayon), 0);
      const dy = Math.max(rayon - py, py - (taille - rayon), 0);
      const dehors = Math.hypot(dx, dy) > rayon;

      const x = (px / taille - 0.5) * 3.5;
      const y = -(py / taille - 0.46) * 3.5;

      const couleur = dansLeCoeur(x, y) ? COEUR : FOND;
      ligne.push(couleur[0], couleur[1], couleur[2], dehors ? 0 : 255);
    }
    lignes.push(Buffer.from(ligne));
  }

  const entete = Buffer.alloc(13);
  entete.writeUInt32BE(taille, 0);
  entete.writeUInt32BE(taille, 4);
  entete[8] = 8;   // 8 bits par canal
  entete[9] = 6;   // RVB + alpha

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    morceau("IHDR", entete),
    morceau("IDAT", deflateSync(Buffer.concat(lignes), { level: 9 })),
    morceau("IEND", Buffer.alloc(0)),
  ]);
}

for (const taille of [180, 192, 512]) {
  const nom = taille === 180 ? "public/apple-touch-icon.png" : `public/icone-${taille}.png`;
  writeFileSync(nom, icone(taille));
  console.log(`${nom} — ${taille}×${taille}`);
}
