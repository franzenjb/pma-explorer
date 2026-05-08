import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Building2,
  Ear,
  Eye,
  Library,
  MonitorSmartphone,
  Network,
  Sparkles,
  Tv,
  Waves,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const museumArc = [
  {
    period: "50 years ago",
    title: "The museum as temple",
    text: "Quiet, expert-led, collection-first. The visitor entered a protected room of authority and learned to look on the museum's terms.",
  },
  {
    period: "20 years ago",
    title: "The museum as destination",
    text: "Architecture, cafés, gift shops, tourism, events, education departments, and blockbuster exhibitions expanded the museum's civic and economic role.",
  },
  {
    period: "10 years ago",
    title: "The museum as platform",
    text: "Digital collections, social media, community programming, participation, inclusion, and visitor experience began to reshape the museum's public identity.",
  },
  {
    period: "Now",
    title: "The museum as contested civic infrastructure",
    text: "Museums are expected to preserve, teach, welcome, convene, publish, entertain, repair, remember, and remain financially resilient all at once.",
  },
];

const futures = [
  {
    horizon: "10 years",
    title: "The porous museum",
    text: "A building less sealed from the city: public passages, study rooms, cafés, classrooms, maker spaces, films, performance, free zones, and repeat local use.",
  },
  {
    horizon: "20 years",
    title: "The learning museum",
    text: "Part library, part university, part archive, part studio. The museum teaches people how to look, compare, question, and connect.",
  },
  {
    horizon: "50 years",
    title: "The memory engine",
    text: "The museum stewards objects, oral histories, digital art, local stories, climate memory, Indigenous knowledge, artist process, and AI-assisted interpretation.",
  },
];

const techHistory = [
  {
    icon: BookOpen,
    title: "Photography and books",
    text: "Art escaped the museum wall through slides, postcards, books, prints, and posters. The museum's monopoly on visual access began to weaken.",
  },
  {
    icon: MonitorSmartphone,
    title: "The web",
    text: "Collections became searchable. Comparison became instant. A student in Maine can put Homer, Hokusai, Turner, Basquiat, and AI imagery in conversation within seconds.",
  },
  {
    icon: Eye,
    title: "The iPhone",
    text: "The visitor now photographs, zooms, shares, translates, compares, and listens while standing in front of the original work. The museum is no longer the only narrator in the room.",
  },
  {
    icon: Tv,
    title: "Samsung Frame and ambient art",
    text: "Digital art displays moved art into domestic life. The living room can now become a rotating gallery, training people to live with images every day.",
  },
  {
    icon: Ear,
    title: "Smart earbuds",
    text: "The future audio tour may become conversational, adaptive, spatial, multilingual, poetic, scholarly, playful, or child-centered on demand.",
  },
  {
    icon: Brain,
    title: "AI interpretation",
    text: "AI can surface context, comparison, symbolism, conservation history, visual structure, and connections across collections — but only if museums guide it with rigor.",
  },
];

const risks = [
  "The museum becomes entertainment scenery instead of a place for serious looking.",
  "Phones and screens fragment attention and weaken contemplation.",
  "Algorithms flatten taste toward popularity and away from difficulty.",
  "AI-generated abundance creates an authenticity crisis.",
  "Digital interpretation becomes gimmick rather than depth.",
  "Access improves technically while belonging remains socially unresolved.",
];

const opportunities = [
  "Radical accessibility through translation, audio, captioning, visual explanation, and adaptive learning.",
  "High-resolution imaging that reveals brushwork, underdrawings, x-ray layers, pigments, and conservation history.",
  "Personal museum clouds that remember saved works, questions, sketches, themes, and return visits.",
  "Global exhibitions linking PMA with Rijksmuseum, MoMA, Smithsonian, Cleveland, Met, and local Maine archives.",
  "Trusted interpretation in a world of synthetic images and visual noise.",
  "New forms of civic participation where the museum preserves not just conclusions, but the process of thinking itself.",
];

const speculativeTech = [
  {
    title: "AI Curatorial Companion",
    text: "A personal guide that remembers prior visits, adapts to your curiosity, and offers scholar, poet, child, artist, or skeptic modes.",
  },
  {
    title: "Spatial AR Layers",
    text: "Glasses reveal underdrawings, previous restorations, lost frames, artist process, comparative works, maps, weather, and historic rooms.",
  },
  {
    title: "Conversational Paintings",
    text: "Not fake artist resurrection, but careful knowledge systems trained on scholarship, letters, conservation notes, and verified museum records.",
  },
  {
    title: "Emotional Cartography",
    text: "Anonymous maps of where visitors slow down, linger, return, feel confused, or experience awe — a new layer of civic museum intelligence.",
  },
  {
    title: "Dynamic Galleries",
    text: "Lighting, interpretation, sound, pacing, density, and sequence shift for quiet study, school groups, evening events, accessibility, or deep research.",
  },
  {
    title: "Maine Light Engine",
    text: "PMA links art to coast, weather, Wabanaki homelands, working waterfronts, climate data, seasonal light, and landscape traditions in a way no generic museum can.",
  },
];

const conversationFragments = [
  "The museum historically controlled access to art, interpretation of art, and the physical experience of art. Technology is dismantling all three monopolies simultaneously.",
  "Technology will not eliminate the museum. It will force the museum to redefine what cannot be digitized — and what becomes more powerful when digitally amplified.",
  "The future museum may not compete with the internet by withholding access. It may compete by creating depth.",
  "Most institutions preserve conclusions. The future museum may also preserve the process of thinking itself.",
  "PMA should not build a bigger museum. It should build Portland's cultural operating system.",
];

const sisterInstitutions = [
  {
    icon: Library,
    title: "Libraries",
    text: "Access beats reverence. Libraries became public workspaces, internet access points, children's learning centers, civic information rooms, local archives, and trusted social infrastructure.",
  },
  {
    icon: Building2,
    title: "Schools and universities",
    text: "Education moved from lecture toward active learning. Museums can teach visual literacy, interpretation, comparison, and inquiry rather than merely delivering labels.",
  },
  {
    icon: Waves,
    title: "Parks and public spaces",
    text: "Great civic places support repeat, informal, low-friction use. The museum should allow wandering, resting, meeting, thinking, and returning without ceremony.",
  },
  {
    icon: Network,
    title: "Archives and performing arts",
    text: "Archives preserve memory with structure. Performance animates time. Together they suggest a museum of objects, voices, events, and living interpretation.",
  },
];

export default function FutureMuseumPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="max-w-5xl">
              <p className="font-data text-[11px] uppercase tracking-[0.24em] text-primary">
                Working paper · Future museum lab
              </p>
              <h1 className="mt-5 font-headline text-4xl font-semibold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                The future art museum is not a bigger building.
                <span className="block text-primary">It is a civic operating system.</span>
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-background/80 sm:text-xl">
                A living white paper and conversation archive on how museums have changed, how technology is changing the act of looking, and how the Portland Museum of Art could become a new kind of public infrastructure for culture, memory, learning, and imagination.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#technology"
                  className="inline-flex items-center gap-2 bg-primary px-5 py-3 font-data text-[12px] font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90"
                >
                  Technology section <ArrowRight className="size-4" />
                </a>
                <a
                  href="#conversation"
                  className="inline-flex items-center gap-2 border border-background/30 px-5 py-3 font-data text-[12px] font-semibold uppercase tracking-[0.18em] text-background hover:border-primary hover:text-primary"
                >
                  Conversation archive
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <hr className="rule-red" />
            <div className="mt-5 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
                  The question
                </p>
                <h2 className="mt-3 font-headline text-3xl font-semibold uppercase leading-tight tracking-tight sm:text-4xl">
                  What is an art museum for in 2050?
                </h2>
              </div>
              <div className="space-y-5 text-base leading-7 text-muted-foreground">
                <p>
                  The Portland Museum of Art expansion should not be judged only by square footage, architectural beauty, or gallery capacity. It should be judged by a harder civic question: what public role should a museum play when art can be searched, reproduced, explained, streamed, enlarged, remixed, and carried in every pocket?
                </p>
                <p>
                  The argument here is not anti-technology and not anti-building. It is pro-depth. Technology will not eliminate the museum. It will force the museum to define what cannot be digitized — and what becomes more powerful when digitally amplified.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <SectionLabel label="Historical arc" title="How museums changed" />
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {museumArc.map((item) => (
                <article key={item.period} className="border border-border bg-card p-5">
                  <p className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
                    {item.period}
                  </p>
                  <h3 className="mt-3 font-headline text-xl font-semibold uppercase leading-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-6 text-muted-foreground">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <SectionLabel label="Future arc" title="How museums may change" />
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {futures.map((item) => (
                <article key={item.horizon} className="border border-border bg-card p-6">
                  <p className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
                    Next {item.horizon}
                  </p>
                  <h3 className="mt-3 font-headline text-2xl font-semibold uppercase leading-tight">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="technology" className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
            <SectionLabel label="Technology" title="The future of looking" />
            <div className="mt-6 max-w-4xl space-y-5 text-base leading-7 text-muted-foreground">
              <p>
                Technology changes the museum more profoundly than architecture because it changes the act of seeing itself. The museum once controlled access to art, interpretation of art, and the physical experience of art. The web, phones, smart displays, earbuds, high-resolution imaging, and AI are dismantling all three monopolies.
              </p>
              <p>
                This does not make the museum obsolete. It makes the museum's purpose sharper. In a world of infinite images, the museum becomes valuable when it creates trust, depth, presence, slowness, comparison, memory, and meaning.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {techHistory.map(({ icon: Icon, title, text }) => (
                <article key={title} className="border border-border bg-card p-5">
                  <span className="inline-flex size-9 items-center justify-center bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <h3 className="mt-4 font-headline text-xl font-semibold uppercase leading-tight">
                    {title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-6 text-muted-foreground">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-foreground text-background">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2">
            <div>
              <p className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
                Risks
              </p>
              <h2 className="mt-3 font-headline text-3xl font-semibold uppercase leading-tight tracking-tight">
                Technology can flatten attention.
              </h2>
              <ul className="mt-6 space-y-3 text-[15px] leading-7 text-background/80">
                {risks.map((risk) => (
                  <li key={risk} className="border-l border-primary pl-4">
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
                Opportunities
              </p>
              <h2 className="mt-3 font-headline text-3xl font-semibold uppercase leading-tight tracking-tight">
                Technology can deepen attention.
              </h2>
              <ul className="mt-6 space-y-3 text-[15px] leading-7 text-background/80">
                {opportunities.map((opportunity) => (
                  <li key={opportunity} className="border-l border-primary pl-4">
                    {opportunity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
            <SectionLabel label="Speculative lab" title="Technologies PMA could imagine — or build" />
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {speculativeTech.map((item) => (
                <article key={item.title} className="group border border-border bg-card p-6 transition-colors hover:border-foreground">
                  <Sparkles className="size-5 text-primary" />
                  <h3 className="mt-4 font-headline text-xl font-semibold uppercase leading-tight group-hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-6 text-muted-foreground">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
            <SectionLabel label="Sister institutions" title="What museums can learn from libraries, schools, parks, archives" />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {sisterInstitutions.map(({ icon: Icon, title, text }) => (
                <article key={title} className="border border-border bg-card p-6">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-headline text-xl font-semibold uppercase leading-tight">
                        {title}
                      </h3>
                      <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="conversation" className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
            <SectionLabel label="Conversation archive" title="Preserve the thinking, not only the conclusion" />
            <div className="mt-6 max-w-4xl space-y-5 text-base leading-7 text-muted-foreground">
              <p>
                The formal white paper should be polished, footnoted, and board-ready. But the conversational version may be more original because it preserves emergence: the leaps, questions, half-formed ideas, and sudden turns where the real thinking happens.
              </p>
              <p>
                Most institutions preserve conclusions. This project argues that the future museum may also preserve the process of thinking itself.
              </p>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-5">
              {conversationFragments.map((fragment, index) => (
                <blockquote key={fragment} className="border border-border bg-card p-5">
                  <p className="font-data text-[10px] uppercase tracking-[0.22em] text-primary">
                    Fragment {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-4 font-headline text-lg font-medium leading-7">
                    “{fragment}”
                  </p>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="font-data text-[10px] uppercase tracking-[0.22em] text-primary-foreground/75">
                  Working next
                </p>
                <h2 className="mt-3 font-headline text-3xl font-semibold uppercase leading-tight tracking-tight sm:text-4xl">
                  The next version should become both a white paper and a living web essay.
                </h2>
              </div>
              <div className="space-y-3 text-[14px] leading-6 text-primary-foreground/85">
                <p>
                  Add peer institutions, PMA-specific civic context, a sharper access argument, future tech prototypes, and a measurement dashboard for belonging, learning, repeat use, and civic value.
                </p>
                <Link
                  href="/collection"
                  className="inline-flex items-center gap-2 font-data text-[11px] font-semibold uppercase tracking-[0.18em] underline underline-offset-4"
                >
                  Return to collection explorer <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function SectionLabel({ label, title }: { label: string; title: string }) {
  return (
    <div>
      <hr className="rule-red" />
      <p className="mt-4 font-data text-[10px] uppercase tracking-[0.22em] text-primary">
        {label}
      </p>
      <h2 className="mt-2 max-w-4xl font-headline text-3xl font-semibold uppercase leading-tight tracking-tight sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}
