import { promises as fs } from "fs";
import path from "path";

// Filesystem is ondersteunend: ruwe chatdumps, screenshots, exports, backups.
// De waarheid blijft PostgreSQL. Faalt het wegschrijven, dan blijft de import
// gewoon bestaan in de database.

export function dataDir(): string {
  return process.env.DATA_DIR || path.join(process.cwd(), "data");
}

export async function saveChatDump(id: string, content: string): Promise<string | null> {
  try {
    const dir = path.join(dataDir(), "chat-imports");
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, `${id}.md`);
    await fs.writeFile(file, content, "utf8");
    return file;
  } catch (err) {
    console.error("Kon chatdump niet wegschrijven:", err);
    return null;
  }
}
