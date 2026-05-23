import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { assertDatabaseConfigured } from "@/lib/prisma";
import { apiError } from "@/lib/api-response";

export async function requireUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      error: apiError("Authentication required.", 401, "AUTHENTICATION_REQUIRED"),
      userId: "",
    };
  }

  try {
    assertDatabaseConfigured();
  } catch (error) {
    return {
      error: apiError(
        error instanceof Error ? error.message : "Database is not configured.",
        503,
        "DATABASE_NOT_CONFIGURED",
      ),
      userId: "",
    };
  }

  return { error: null, userId: session.user.id };
}
