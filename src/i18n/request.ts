import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  messagesByLocale,
} from "@/lib/i18n";

export default getRequestConfig(async () => {
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const headerLocale = requestHeaders.get("x-trippilot-locale");
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  const locale = isLocale(headerLocale)
    ? headerLocale
    : isLocale(cookieLocale)
      ? cookieLocale
      : defaultLocale;

  return {
    locale,
    messages: messagesByLocale[locale],
  };
});
