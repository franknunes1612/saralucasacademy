import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { SaraLucasLogo } from "@/components/brand/SaraLucasLogo";

export function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-espresso border-t border-cream/[0.08] px-4 md:px-16 py-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 flex-wrap">
        <SaraLucasLogo variant="light" />

        <ul className="flex gap-8 list-none">
          <li>
            <Link
              to="/terms"
              className="text-xs tracking-widest uppercase text-cream/60 hover:text-cream transition-colors no-underline"
            >
              {language === "pt" ? "Política de Privacidade" : "Privacy Policy"}
            </Link>
          </li>
          <li>
            <Link
              to="/terms"
              className="text-xs tracking-widest uppercase text-cream/60 hover:text-cream transition-colors no-underline"
            >
              {language === "pt" ? "Termos de Serviço" : "Terms of Service"}
            </Link>
          </li>
          <li>
            <a
              href="https://www.instagram.com/saralucas_pt_nutricionista/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-widest uppercase text-cream/60 hover:text-cream transition-colors no-underline"
            >
              Instagram
            </a>
          </li>
          <li>
            <Link
              to="/support"
              className="text-xs tracking-widest uppercase text-cream/60 hover:text-cream transition-colors no-underline"
            >
              {language === "pt" ? "Contacto" : "Contact"}
            </Link>
          </li>
        </ul>

        <p className="text-xs text-cream/40">
          © {new Date().getFullYear()} Sara Lucas. {language === "pt" ? "Todos os direitos reservados." : "All rights reserved."}
        </p>
      </div>
    </footer>
  );
}
