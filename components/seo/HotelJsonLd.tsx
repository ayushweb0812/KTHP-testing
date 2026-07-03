import { JsonLd } from "./JsonLd";
import { buildHotelSchema } from "@/lib/seo/schema";
import { SOCIAL } from "@/lib/seo/site";

/** Site-wide Hotel entity — referenced by @id from other page schemas. */
export function HotelJsonLd() {
  const data = {
    ...buildHotelSchema(),
    sameAs: [SOCIAL.tripAdvisor, SOCIAL.instagram].filter(Boolean),
  };
  return <JsonLd data={data} />;
}
