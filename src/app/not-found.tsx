import Link from "next/link";
import { cookies } from "next/headers";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function NotFound() {
  await cookies(); // opt into dynamic rendering
  const { dict, lang } = await getDictionary();

  const copy = lang === "bg"
    ? {
        eyebrow: "404",
        title: "Страницата не е намерена",
        subtitle: "Страницата, която търсите, не съществува или е била преместена.",
        home: "Към началото",
        book: "Запазете час",
      }
    : {
        eyebrow: "404",
        title: "Page not found",
        subtitle: "The page you are looking for doesn't exist or has moved.",
        home: "Go home",
        book: "Book appointment",
      };

  return (
    <div className="page-shell page-shell--soft">
      <div className="container" style={{ textAlign: "center", padding: "4rem 0" }}>
        <span className="clinical-badge" style={{ marginBottom: "1rem" }}>
          {copy.eyebrow}
        </span>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "0.75rem" }}>
          {copy.title}
        </h1>
        <p className="text-muted" style={{ maxWidth: "36rem", margin: "0 auto 2rem" }}>
          {copy.subtitle}
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-outline">{copy.home}</Link>
          <Link href="/book" className="btn btn-primary">{copy.book}</Link>
        </div>
        <p className="text-muted" style={{ marginTop: "3rem", fontSize: "0.875rem" }}>
          {dict.footer.phone}
        </p>
      </div>
    </div>
  );
}
