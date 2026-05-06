import { ReactNode } from "react";

type Props = {
  number?: string;
  kicker?: string;
  title: ReactNode;
  subtitle?: ReactNode;
};

export function SectionHeading({ number, kicker, title, subtitle }: Props) {
  return (
    <div className="space-y-3">
      <hr className="rule-red" />
      <div className="space-y-1">
        <p className="flex items-baseline gap-3">
          {number ? <span className="section-num">{number}</span> : null}
          {kicker ? (
            <span className="font-data text-[10px] uppercase tracking-[0.24em] text-primary">
              {kicker}
            </span>
          ) : null}
        </p>
        <h2 className="font-headline text-[24px] font-bold tracking-tight sm:text-[28px]">
          {title}
        </h2>
        {subtitle ? (
          <p className="max-w-3xl text-[14px] text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
