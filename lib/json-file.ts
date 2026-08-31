import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/storage";

export async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  const filePath = path.join(getDataDir(), filename);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const dir = getDataDir();
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}
