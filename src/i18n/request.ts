import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import he from "../../messages/he.json";
import en from "../../messages/en.json";

const messages = { he, en };

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value === "en" ? "en" : "he";

  return {
    locale,
    messages: messages[locale],
  };
});
