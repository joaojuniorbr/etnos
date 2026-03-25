import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryGameLevelSelector } from "./MemoryGameLevelSelector";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

describe("MemoryGameLevelSelector", () => {
  it("retorna null quando não houver conteúdo", () => {
    const { container } = render(
      <MemoryGameLevelSelector
        availableLevels={[
          {
            level: 1,
            label: "Nível 1",
            pairs: 3,
            pointBonus: 100,
            pointPenalty: 50,
            pointAddition: 50,
          },
        ]}
        content={[]}
        onSelectLevel={vi.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renderiza os níveis e encaminha a seleção", () => {
    const onSelectLevel = vi.fn();

    render(
      <MemoryGameLevelSelector
        availableLevels={[
          {
            level: 1,
            label: "Nível 1",
            pairs: 3,
            pointBonus: 100,
            pointPenalty: 50,
            pointAddition: 50,
          },
          {
            level: 2,
            label: "Nível 2",
            pairs: 4,
            pointBonus: 150,
            pointPenalty: 50,
            pointAddition: 50,
          },
        ]}
        content={[{ name: "chimarrao", image: "/a.jpg" }]}
        onSelectLevel={onSelectLevel}
        selectedCharacter={
          {
            name: "Anita",
            slug: "anita",
            imageUrl: "/anita.png",
          } as any
        }
      />,
    );

    expect(screen.getByText("Escolha o nível para começar")).toBeTruthy();
    expect(screen.getByAltText("Etnos").getAttribute("src")).toBe("/anita.png");

    fireEvent.click(screen.getByText("Nível 2"));

    expect(onSelectLevel).toHaveBeenCalledWith(2);
  });
});
