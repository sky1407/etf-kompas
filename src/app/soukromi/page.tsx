import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Zpracování osobních údajů – ETF Kompas" };

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 text-[15px] leading-relaxed sm:px-6">
      <Link href="/" className="text-sm underline underline-offset-2">
        ← Zpět
      </Link>
      <h1 className="mt-6 font-display text-3xl font-bold">Zpracování osobních údajů</h1>
      <p className="mt-4">
        <strong>Co ukládáme:</strong> e-mail, vybraný fond, zadanou částku a dobu, variantu reklamy a parametry UTM. IP
        adresu neukládáme, jen její jednosměrný otisk pro ochranu proti zneužití formuláře.
      </p>
      <p className="mt-3">
        <strong>Proč:</strong> abychom vám poslali váš ETF plán a občas tip k ETF investování (oprávněný zájem a váš souhlas
        odesláním formuláře). Odhlásit se můžete odpovědí na kterýkoli e-mail.
      </p>
      <p className="mt-3">
        <strong>Jak dlouho:</strong> do odhlášení, nejdéle 2 roky od posledního kontaktu.
      </p>
      <p className="mt-3">
        <strong>Měření:</strong> anonymní statistiky návštěvnosti (PostHog, servery v EU) bez cookies a bez nahrávání
        obrazovky.
      </p>
      <p className="mt-3">
        <strong>Vaše práva:</strong> přístup, oprava, výmaz, omezení zpracování a stížnost u ÚOOÚ (uoou.gov.cz).
      </p>
    </main>
  );
}
