import { JsonLd } from "./JsonLd";

type PageJsonLdProps = {
  schemas: Record<string, unknown>[];
};

/** Renders one or more JSON-LD blocks for a page. */
export function PageJsonLd({ schemas }: PageJsonLdProps) {
  return (
    <>
      {schemas.map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}
    </>
  );
}
