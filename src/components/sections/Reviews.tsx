import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StarRating } from "@/components/ui/StarRating";
import type { Review } from "@/data/reviews.mock";
import { formatDate } from "@/lib/format";
import { getReviews } from "@/services/content/reviewsService";
import { getReviewsContent } from "@/services/content/siteContentService";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="flex h-full flex-col rounded-[var(--radius-panel)] border border-line bg-panel p-6 transition-colors duration-200 hover:border-line-strong">
      <div className="flex items-center justify-between gap-3">
        <StarRating rating={review.rating} />
        {review.source === "demo" ? <span className="text-[0.6875rem] text-mist">Esempio</span> : null}
      </div>
      <blockquote className="mt-5 flex-1 text-paper/90">
        <p>{review.text}</p>
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
        {review.avatarUrl ? (
          // Avatar remoti: configurare images.remotePatterns e passare a next/image
          // eslint-disable-next-line @next/next/no-img-element
          <img src={review.avatarUrl} alt="" width={36} height={36} className="size-9 rounded-full object-cover" />
        ) : (
          <span aria-hidden="true" className="font-wide grid size-9 place-items-center rounded-full bg-panel-raised text-xs font-semibold text-mist ring-1 ring-line-strong">
            {initials(review.author)}
          </span>
        )}
        <div>
          <p className="text-sm font-medium text-paper">{review.author}</p>
          <p className="text-xs text-mist">
            <time dateTime={review.date}>{formatDate(review.date)}</time>
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

export async function Reviews() {
  const [{ reviews, isDemo }, reviewsContent] = await Promise.all([getReviews(), getReviewsContent()]);

  return (
    <section aria-labelledby="reviews-title" className="py-24 sm:py-32">
      <Container>
        <SectionHeader
          id="reviews-title"
          title={reviewsContent.title}
          aside={isDemo ? <DemoBadge label={reviewsContent.demoBadgeLabel} /> : null}
        />
        {isDemo ? <p className="mt-4 max-w-xl text-sm text-mist">{reviewsContent.demoNote}</p> : null}

        {reviews.length === 0 ? (
          <p className="mt-12 text-mist">Le recensioni saranno pubblicate a breve.</p>
        ) : (
          <ul className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {reviews.map((r, i) => (
              <li key={r.id}>
                <Reveal delay={i * 70} className="h-full">
                  <ReviewCard review={r} />
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
