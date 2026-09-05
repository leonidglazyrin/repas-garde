import { getSupabase, IS_DEMO } from "./supabase";
import { storageGet, storageSet } from "./storage";
import type { Member } from "./types";

export const PROFILE_COLORS = ["#7c3aed", "#2563eb", "#059669", "#ea580c", "#db2777", "#0891b2", "#ca8a04", "#dc2626"];

function key(householdId: string) {
  return `repas-garde-profiles-${householdId}`;
}

type Profile = Pick<Member, "id" | "profile_color" | "restrictions">;

export async function getMemberProfiles(householdId: string): Promise<Profile[]> {
  if (IS_DEMO) {
    try {
      return JSON.parse(storageGet(key(householdId)) || "[]");
    } catch {
      return [];
    }
  }
  const sb = getSupabase()!;
  const { data } = await sb.from("members").select("id, profile_color, restrictions").eq("household_id", householdId);
  return (data as Profile[]) ?? [];
}

export async function saveMemberProfile(member: Member): Promise<void> {
  if (IS_DEMO) {
    const all = await getMemberProfiles(member.household_id);
    const next = all.filter((p) => p.id !== member.id).concat({ id: member.id, profile_color: member.profile_color, restrictions: member.restrictions });
    storageSet(key(member.household_id), JSON.stringify(next));
    return;
  }
  const sb = getSupabase()!;
  await sb.from("members").update({ profile_color: member.profile_color, restrictions: member.restrictions }).eq("id", member.id);
}
