import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CollectionBrowser } from "@/components/collection-browser";
import { loadCategories, loadDecades, loadWorks } from "@/lib/works";

export const metadata = {
  title: "Search the collection · PMA Explorer",
  description:
    "Search and filter the demo collection — by title, artist, medium, accession number, category, or decade.",
};

type SearchParams = Promise<{
  category?: string;
  q?: string;
  sort?: string;
  decade?: string;
  artist?: string;
}>;

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const works = loadWorks();
  const categories = loadCategories();
  const decades = loadDecades();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6">
        <section id="collection" className="pt-4 sm:pt-6">
          <CollectionBrowser
            works={works}
            categories={categories}
            decades={decades}
            initial={sp}
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
