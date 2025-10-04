import { Crafts } from "../models/astrub_economy/Craft";
import { Ressources } from "../models/astrub_economy/Resource";
import { CraftEnum, ResourceEnum } from "../models/astrub_economy/Enums";
import * as fs from "fs";
import * as path from "path";

// Helper types
type Recipe = Record<string, number>;

type CraftDef = {
  name: string;
  recipe: Recipe;
  jobs: string[];
};

// Normalize keys in recipe: in source, keys can be ResourceEnum or CraftEnum values (strings)
// We'll detect whether a key corresponds to a craft by matching it to Crafts entries names

function buildNameToCraftKey(): Map<string, CraftEnum> {
  const map = new Map<string, CraftEnum>();
  (Object.keys(Crafts) as (keyof typeof Crafts)[]).forEach((k) => {
    const craft = (Crafts as any)[k];
    // craft.name is a string value of CraftEnum
    map.set(craft.name, k as unknown as CraftEnum);
  });
  return map;
}

function buildDirectUsage(): Map<ResourceEnum, Set<CraftEnum>> {
  const direct = new Map<ResourceEnum, Set<CraftEnum>>();
  const resources = Object.keys(Ressources) as (keyof typeof Ressources)[];
  const craftsKeys = Object.keys(Crafts) as (keyof typeof Crafts)[];

  for (const rk of resources) {
    const resName = (Ressources as any)[rk].name as ResourceEnum;
    direct.set(resName, new Set<CraftEnum>());
  }

  for (const ck of craftsKeys) {
    const craft = (Crafts as any)[ck] as CraftDef;
    const recipe = craft.recipe || {};
    for (const key of Object.keys(recipe)) {
      // If key equals a ResourceEnum value present in Ressources, count as direct
      // We compare against resource names
      for (const rk of Object.keys(Ressources) as (keyof typeof Ressources)[]) {
        const res = (Ressources as any)[rk];
        if (key === res.name) {
          const set = direct.get(res.name as ResourceEnum)!;
          set.add(ck as unknown as CraftEnum);
        }
      }
    }
  }

  return direct;
}

function buildCraftDependencies(nameToCraft: Map<string, CraftEnum>): Map<CraftEnum, Set<CraftEnum>> {
  // For each craft, list crafts it depends on (edges: craft -> dependency craft)
  const dep = new Map<CraftEnum, Set<CraftEnum>>();
  const craftsKeys = Object.keys(Crafts) as (keyof typeof Crafts)[];
  for (const ck of craftsKeys) {
    const craft = (Crafts as any)[ck] as CraftDef;
    const deps = new Set<CraftEnum>();
    for (const key of Object.keys(craft.recipe || {})) {
      const maybe = nameToCraft.get(key);
      if (maybe) deps.add(maybe);
    }
    dep.set(ck as unknown as CraftEnum, deps);
  }
  return dep;
}

function craftsThatEventuallyDependOn(targetCraft: CraftEnum, deps: Map<CraftEnum, Set<CraftEnum>>): Set<CraftEnum> {
  // Reverse traversal: find all crafts C such that there is a path C -> ... -> targetCraft
  const reverse = new Map<CraftEnum, Set<CraftEnum>>();
  for (const [c, ds] of deps.entries()) {
    for (const d of ds) {
      if (!reverse.has(d)) reverse.set(d, new Set());
      reverse.get(d)!.add(c);
    }
  }
  const result = new Set<CraftEnum>();
  const stack: CraftEnum[] = [];
  if (reverse.has(targetCraft)) {
    for (const parent of reverse.get(targetCraft)!) stack.push(parent);
  }
  while (stack.length) {
    const cur = stack.pop()!;
    if (result.has(cur)) continue;
    result.add(cur);
    if (reverse.has(cur)) {
      for (const parent of reverse.get(cur)!) stack.push(parent);
    }
  }
  return result;
}

function computeIndirectUsage(direct: Map<ResourceEnum, Set<CraftEnum>>): Map<ResourceEnum, Set<CraftEnum>> {
  const nameToCraft = buildNameToCraftKey();
  const deps = buildCraftDependencies(nameToCraft);

  const indirect = new Map<ResourceEnum, Set<CraftEnum>>();

  for (const [res, directCrafts] of direct.entries()) {
    const ind = new Set<CraftEnum>();
    for (const c of directCrafts) {
      const upwards = craftsThatEventuallyDependOn(c, deps);
      for (const u of upwards) {
        // avoid counting direct crafts here
        if (!directCrafts.has(u)) ind.add(u);
      }
    }
    indirect.set(res, ind);
  }

  return indirect;
}

function generateCSV(): string {
  const direct = buildDirectUsage();
  const indirect = computeIndirectUsage(direct);

  const rows: string[] = [];
  rows.push(["Ressource","Niveau","Nombre recettes directes","Nombre recettes indirectes","Total"].join(","));

  // Keep only base resources (those with a job defined) — from Ressources map
  const resourceEntries = Object.values(Ressources) as any[];
  const baseResources = resourceEntries.filter(r => r.job); // excludes Kamas and neutral ones

  // Sort by name for stable output
  baseResources.sort((a,b) => a.name.localeCompare(b.name));

  for (const res of baseResources) {
    const rEnum = res.name as ResourceEnum;
    const dCount = direct.get(rEnum)?.size ?? 0;
    const iCount = indirect.get(rEnum)?.size ?? 0;
    const total = dCount + iCount;
    rows.push([res.name, String(res.level), String(dCount), String(iCount), String(total)].join(","));
  }

  return rows.join("\n");
}

function main() {
  const csv = generateCSV();
  const outDir = path.resolve(__dirname, "../../docs");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "crafts_by_resource.csv");
  fs.writeFileSync(outPath, csv, { encoding: "utf8" });
  // eslint-disable-next-line no-console
  console.log(`CSV généré: ${outPath}`);
}

// Execute only if run directly with node
if (require.main === module) {
  main();
}

export {};
