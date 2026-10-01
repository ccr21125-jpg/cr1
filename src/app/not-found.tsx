import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getSiteName } from "@/services/content/siteContentService";

export default async function NotFound() {
  const siteName = await getSiteName();

  return (
    <>
      <Navbar siteName={siteName} />
      <Container className="flex min-h-[60vh] flex-col items-start justify-center py-24">
        <p className="font-display tabular text-7xl text-line-strong">404</p>
        <h1 className="font-display mt-4 text-4xl">Pagina non trovata.</h1>
        <p className="mt-4 max-w-md text-mist">
          L&apos;indirizzo potrebbe essere errato o la pagina è stata spostata.
        </p>
        <ButtonLink href="/" className="mt-8">
          Torna alla home
        </ButtonLink>
      </Container>
      <Footer siteName={siteName} />
    </>
  );
}
