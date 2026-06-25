import { render, screen } from "@testing-library/react";

import AuthorImage from "./AuthorImage";

// Ten sam placeholder, którego używa komponent (gdy autor nie ma zdjęcia).
const PLACEHOLDER_IMAGE = "https://static.productionready.io/images/smiley-cyrus.jpg";

describe("AuthorImage", () => {
  it("renderuje <img> z przekazanym adresem URL", () => {
    const url = "https://example.com/avatar.jpg";
    render(<AuthorImage src={url} alt="Jane Doe" />);

    // Pobieramy obrazek po roli + dostępnej nazwie (alt). To zalecane podejście RTL:
    // testujemy z perspektywy użytkownika/technologii asystujących, nie po klasach CSS.
    const image = screen.getByRole("img", { name: "Jane Doe" });

    expect(image).toHaveAttribute("src", url);
  });

  it("renderuje placeholder, gdy src jest pusty", () => {
    // Pusty string reprezentuje "brak zdjęcia" (zgodnie z typem src: string).
    // null zadziałałby tak samo, bo komponent używa `src || PLACEHOLDER` — null jest falsy.
    render(<AuthorImage src="" alt="Jane Doe" />);

    const image = screen.getByRole("img", { name: "Jane Doe" });

    expect(image).toHaveAttribute("src", PLACEHOLDER_IMAGE);
  });
});
