import {QuestTemplates} from "../models/astrub_economy/QuestTemplate";
import {Ressources} from "../models/astrub_economy/Resource";
import {Crafts} from "../models/astrub_economy/Craft";
import * as fs from "fs";
import * as path from "path";

// Build direct dependency maps between items
// Crafts have recipes consisting of Resources and/or other Crafts by name

type StringSet = Set<string>;

const craftNames: string[] = Object.keys(Crafts);
const resourceNames: string[] = Object.keys(Ressources);

// Map: ingredient (resource or craft) -> set of crafts that directly depend on it
const inverseDeps: Map<string, StringSet> = new Map();

for (const craftName of craftNames) {
    const craft: any = (Crafts as any)[craftName];
    const recipe: Record<string, number> = craft?.recipe || {};
    for (const ingredient of Object.keys(recipe)) {
        if (!inverseDeps.has(ingredient)) inverseDeps.set(ingredient, new Set());
        inverseDeps.get(ingredient)!.add(craftName);
    }
}

function getAncestorCrafts(itemName: string): Set<string> {
    // All crafts that (transitively) depend on itemName
    const result = new Set<string>();
    const stack: string[] = [];

    // Start with direct users of itemName
    const directUsers = inverseDeps.get(itemName);
    if (directUsers) {
        for (const c of directUsers) {
            result.add(c);
            stack.push(c);
        }
    }

    while (stack.length) {
        const current = stack.pop()!;
        const users = inverseDeps.get(current);
        if (!users) continue;
        for (const u of users) {
            if (!result.has(u)) {
                result.add(u);
                stack.push(u);
            }
        }
    }

    return result;
}

function getDescendantCrafts(itemName: string): Set<string> {
    // Only meaningful if itemName is a craft: traverse its recipe down to find crafts it uses (recursively)
    if (!(Crafts as any)[itemName]) return new Set();

    const result = new Set<string>();
    const visited = new Set<string>();

    function dfs(name: string) {
        if (visited.has(name)) return;
        visited.add(name);
        const craft: any = (Crafts as any)[name];
        if (!craft) return;
        const recipe: Record<string, number> = craft.recipe || {};
        for (const ing of Object.keys(recipe)) {
            // If ingredient is a craft, include and continue
            if ((Crafts as any)[ing]) {
                if (!result.has(ing)) result.add(ing);
                dfs(ing);
            }
            // If ingredient is a resource, stop traversal on that branch
        }
    }

    dfs(itemName);
    // We don't want to include the starting craft itself in descendants
    result.delete(itemName);
    return result;
}

// Pre-index quests by required item for quick lookup
const questsByRequiredItem: Map<string, StringSet> = new Map();
for (const [qName, q] of Object.entries(QuestTemplates)) {
    for (const item of Object.keys(q.requiredItems)) {
        if (!questsByRequiredItem.has(item)) questsByRequiredItem.set(item, new Set());
        questsByRequiredItem.get(item)!.add(qName);
    }
}

function getDirectQuests(itemName: string): Set<string> {
    return new Set(questsByRequiredItem.get(itemName) || []);
}

function getIndirectQuests(itemName: string): Set<string> {
    const result = new Set<string>();

    const isCraft = Boolean((Crafts as any)[itemName]);
    const isResource = Boolean((Ressources as any)[itemName]);

    // Include quests that require any craft that (recursively) depends on the item (upstream users)
    // Applies to both resources and crafts
    const ancestorCrafts = getAncestorCrafts(itemName);
    for (const c of ancestorCrafts) {
        const qs = questsByRequiredItem.get(c);
        if (qs) for (const q of qs) result.add(q);
    }

    // For crafts: also include quests that require any lower/ingredient craft it depends on (downstream)
    if (isCraft) {
        const descendantCrafts = getDescendantCrafts(itemName);
        for (const c of descendantCrafts) {
            const qs = questsByRequiredItem.get(c);
            if (qs) for (const q of qs) result.add(q);
        }
    }

    // Exclude direct occurrences from indirect to keep counts distinct
    const direct = getDirectQuests(itemName);
    for (const d of direct) result.delete(d);

    return result;
}

// Build CSV content
function generateCSV(): string {
    const rows: string[] = [];
    rows.push(["item","type","nb_quests_direct","nb_quests_indirect","total"].join(","));

    function addRow(itemName: string, type: string) {
        const direct = getDirectQuests(itemName);
        const indirect = getIndirectQuests(itemName);
        rows.push([
            JSON.stringify(itemName),
            type,
            String(direct.size),
            String(indirect.size),
            String(direct.size + indirect.size)
        ].join(","));
    }

    for (const r of resourceNames) addRow(r, "resource");
    for (const c of craftNames) addRow(c, "craft");

    return rows.join("\n");
}

function main() {
    const csv = generateCSV();
    const outDir = path.resolve(__dirname, "../../docs");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, "quests_dependencies.csv");
    fs.writeFileSync(outPath, csv, { encoding: "utf8" });
    // eslint-disable-next-line no-console
    console.log(`CSV généré: ${outPath}`);
}

if (require.main === module) {
    main();
}

export {};
