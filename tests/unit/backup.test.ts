// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { gunzipSync } from "node:zlib";

const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
function backup(fail: boolean) {
    const root = mkdtempSync(path.join(tmpdir(), "clinic-backup-test-"));
    roots.push(root);
    const bin = path.join(root, "bin");
    mkdirSync(bin);
    writeFileSync(path.join(bin, "pg_dump"), `#!/bin/sh\nwhile [ "$1" != "-f" ]; do shift; done\nshift\nprintf 'SELECT 1;\\n' > "$1"\nexit ${fail ? 1 : 0}\n`, { mode: 0o700 });
    const dir = path.join(root, "backups with spaces");
    const result = spawnSync("sh", ["scripts/backup.sh"], { encoding: "utf8", env: {
        ...process.env, PATH: `${bin}:${process.env.PATH}`, BACKUP_DIR: dir,
        POSTGRES_USER: "test", POSTGRES_DB: "test", POSTGRES_PASSWORD: "test",
    } });
    return { result, dir };
}
describe("database backups", () => {
    it("does not report success or retain a partial archive when pg_dump fails", () => {
        const { result, dir } = backup(true);
        expect(result.status).not.toBe(0);
        expect(result.stdout).not.toContain("successful");
        expect(readdirSync(dir)).toEqual([]);
    });
    it("publishes a valid archive readable only by its owner", () => {
        const { result, dir } = backup(false);
        expect(result.status).toBe(0);
        const files = readdirSync(dir);
        expect(files).toHaveLength(1);
        const file = path.join(dir, files[0]);
        expect(gunzipSync(readFileSync(file)).toString()).toBe("SELECT 1;\n");
        expect(statSync(file).mode & 0o777).toBe(0o600);
    });
});
