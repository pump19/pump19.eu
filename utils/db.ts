import { Database } from "@db/sqlite";

const db = new Database(Deno.env.get("PUMP19_CONTENT_DATABASE") ?? "empty.db3");
onbeforeunload = () => {
  db.close();
};

interface Code {
  key: string;
  description: string;
  code_type: string;
  code: string;
  uid_owner: number;
}

export type PreviewCode = Pick<Code, "key" | "description" | "code_type">;
export type ShowCode = Pick<Code, "description" | "code_type" | "code">;
export type AddCode = Pick<
  Code,
  "description" | "code_type" | "code" | "uid_owner"
>;

const Queries = {
  addCode: db.prepare(
    "INSERT INTO codefall (description, code_type, code, uid_owner) VALUES (:description, :code_type, :code, :uid_owner)",
  ),
  tryClaim: db.prepare(
    "UPDATE codefall SET uid_claimed = :userId, claimed_at = unixepoch() WHERE uid_claimed IS 0 AND cid = (SELECT cid FROM codefall_unclaimed WHERE key IS :key)",
  ),
  unclaimedCodes: db.prepare(
    "SELECT key, description, code_type FROM codefall_unclaimed WHERE uid_owner IS :userId ORDER BY cid DESC",
  ),
  unclaimedCode: db.prepare(
    "SELECT key, description, code_type FROM codefall_unclaimed WHERE key IS :key",
  ),
  claimedCodes: db.prepare(
    "SELECT key, description, code_type FROM codefall_claimed WHERE uid_claimed IS :userId ORDER BY claimed_at DESC",
  ),
  claimedCode: db.prepare(
    "SELECT description, code_type, code FROM codefall codefall_claimed WHERE cid = (SELECT cid FROM codefall_claimed WHERE key IS :key AND uid_claimed IS :userId)",
  ),
  giftedCodeCount: db.prepare(
    "SELECT COUNT(*) FROM codefall_claimed WHERE uid_owner IS :userId ORDER BY cid DESC",
  ),
};

export function addCode(code: AddCode): number {
  return Queries.addCode.run(code);
}

export function tryClaim(key: string, userId: number): number {
  return Queries.tryClaim.run({ key, userId });
}

export function getUnclaimedCodes(userId: number): PreviewCode[] {
  return Queries.unclaimedCodes.all<PreviewCode>({ userId });
}

export function getUnclaimedCode(key: string): PreviewCode | undefined {
  return Queries.unclaimedCode.get<PreviewCode>({ key });
}

export function getGiftedCodeCount(userId: number) {
  return Queries.giftedCodeCount.value({ userId })?.at(0) ?? 0;
}

export function getClaimedCodes(userId: number): PreviewCode[] {
  return Queries.claimedCodes.all<PreviewCode>({ userId });
}

export function getClaimedCode(
  key: string,
  userId: number,
): ShowCode | undefined {
  return Queries.claimedCode.get<ShowCode>({ key, userId });
}
