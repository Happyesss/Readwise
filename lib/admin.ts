import { getUserId } from "@/lib/auth";

export const getIsAdmin = async () => {
  const userId = await getUserId();
  const adminIds = process.env.SUPABASE_ADMIN_IDS?.split(", ") || []; // stored in .env.local file as string separated by comma(,) and space( )

  if (!userId) return false;

  return adminIds.indexOf(userId) !== -1;
};
