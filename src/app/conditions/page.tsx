"use client";

import PageIntro from "@/components/PageIntro";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Conditions() {
  const { dict } = useLanguage();

  return (
    <div className="page-shell page-shell--soft">
      <div className="container">
        <PageIntro
          eyebrow={dict.header.nav.conditions}
          title={dict.conditions.title}
          subtitle={dict.conditions.subtitle}
        />

        <div className="card-grid">
          <div className="premium-card">
            <h3>{dict.conditions.respiratory.title}</h3>
            <ul className="list-checked">
              {dict.conditions.respiratory.list.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <div className="premium-card">
            <h3>{dict.conditions.gastro.title}</h3>
            <ul className="list-checked">
              {dict.conditions.gastro.list.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <div className="premium-card">
            <h3>{dict.conditions.allergy.title}</h3>
            <ul className="list-checked">
              {dict.conditions.allergy.list.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <div className="premium-card">
            <h3>{dict.conditions.neonatal.title}</h3>
            <ul className="list-checked">
              {dict.conditions.neonatal.list.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <div className="premium-card">
            <h3>{dict.conditions.general.title}</h3>
            <ul className="list-checked">
              {dict.conditions.general.list.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
