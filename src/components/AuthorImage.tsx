import { useState } from "react";

/**
 * Domyślny awatar RealWorld — używany, gdy autor nie ma własnego zdjęcia.
 * (Ten sam placeholder stosuje oryginalny Conduit.)
 */
const PLACEHOLDER_IMAGE = "https://static.productionready.io/images/smiley-cyrus.jpg";

interface AuthorImageProps {
  src: string; // article.author.image (może być pustym stringiem)
  alt: string; // zwykle nazwa użytkownika — ważne dla dostępności
  className?: string; // opcjonalne klasy CSS różnią się zależnie od miejsca użycia
}

/**
 * Awatar autora z DWIEMA liniami obrony przed brakiem zdjęcia:
 * 1) pusty `src` -> od razu pokazujemy placeholder,
 * 2) `src` istnieje, ale obrazek nie ładuje się (np. 404) -> onError podmienia na placeholder.
 *
 * Dlaczego stan, a nie zwykła zmienna? Bo podmiana w onError musi spowodować
 * ponowne renderowanie z nowym `src` — a do tego służy useState.
 */
export default function AuthorImage({ src, alt, className }: AuthorImageProps) {
  const [imageSrc, setImageSrc] = useState(src || PLACEHOLDER_IMAGE);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => {
        // Guard chroni przed nieskończoną pętlą, gdyby sam placeholder się nie wczytał.
        if (imageSrc !== PLACEHOLDER_IMAGE) {
          setImageSrc(PLACEHOLDER_IMAGE);
        }
      }}
    />
  );
}
