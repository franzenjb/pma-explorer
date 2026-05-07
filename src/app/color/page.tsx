import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ColorBrowser } from "@/components/color-browser";
import { loadByHue, loadHueBuckets, loadWorks } from "@/lib/works";

export const metadata = {
  title: "Color of Maine · PMA Explorer",
  description:
    "Every work in the collection sorted by dominant hue. Scroll from Atlantic blues to Hopper yellows.",
};

export default function ColorPage() {
  const sorted = loadByHue();
  const buckets = loadHueBuckets();
  const total = loadWorks().length;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6">
        <ColorBrowser works={sorted} buckets={buckets} total={total} />
      </main>
      <SiteFooter />
    </>
  );
}
