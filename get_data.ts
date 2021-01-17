import { ensureFileSync } from "https://deno.land/std@0.83.0/fs/ensure_file.ts";
import { exists } from "https://deno.land/std/fs/mod.ts";

export async function writeParkData(date: string) {
  const parks = [
    "WaltDisneyWorldMagicKingdom",
    "WaltDisneyWorldEpcot",
    "WaltDisneyWorldHollywoodStudios",
    "WaltDisneyWorldAnimalKingdom",
  ];
  const file = `${date}-times.json`;
  ensureFileSync(file);
  let output = await Deno.readTextFile(file);
  if (!output) {
    output = "[]";
  }
  const existing = await JSON.parse(output);
  const magicKingdom = await fetch(
    "https://api.themeparks.wiki/preview/parks/WaltDisneyWorldMagicKingdom/waittime"
  );
  const epcot = await fetch(
    "https://api.themeparks.wiki/preview/parks/WaltDisneyWorldEpcot/waittime"
  );
  const hollywoodStudios = await fetch(
    "https://api.themeparks.wiki/preview/parks/WaltDisneyWorldHollywoodStudios/waittime"
  );
  const animalKingdom = await fetch(
    "https://api.themeparks.wiki/preview/parks/WaltDisneyWorldAnimalKingdom/waittime"
  );
  Promise.all([existing, magicKingdom, epcot, hollywoodStudios, animalKingdom])
    .then(async ([ex, mk, ep, hs, ak]) => {
      const dex = await ex;
      const dmk = await mk.json();
      const dep = await ep.json();
      const dhs = await hs.json();
      const dak = await ak.json();
      return dex.concat(dmk.concat(dep.concat(dhs.concat(dak))));
    })
    .then((responseText) => {
      const write = Deno.writeTextFile(file, JSON.stringify(responseText));
    });
}
export function cleanData(date: string) {
  const file = `${date}-times.json`;
  exists(file).then((result: boolean) => {
    if (result) {
      Deno.removeSync(`${date}-times.json`);
    }
  });
}
const date = new Date();
let oldDate = new Date();
oldDate.setDate(oldDate.getDate() - 2);
let formatted_date =
  date.getMonth() + 1 + "-" + date.getDate() + "-" + date.getFullYear();
let old_formatted_date =
  oldDate.getMonth() +
  1 +
  "-" +
  oldDate.getDate() +
  "-" +
  oldDate.getFullYear();

cleanData(old_formatted_date);
writeParkData(formatted_date);
