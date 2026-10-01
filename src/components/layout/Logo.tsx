import Image from "next/image";
import Link from "next/link";

/** Logo aziendale (public/logo.png) su tessera chiara per garantire contrasto sul tema scuro. */
export function Logo({ name, onClick }: { name: string; onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="group inline-flex items-center gap-2.5" aria-label={`${name}, home`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
        <Image src="/logo.png" alt="" width={296} height={396} priority className="h-[22px] w-auto" />
      </span>
      <span className="font-wide text-[0.975rem] font-semibold tracking-tight text-paper">{name}</span>
    </Link>
  );
}
