import type { Star } from "../types/star";

////
const mockStars: Star[] = [
  {
    StarID: 1,
    StarName: "Mock Alpha",
    ShortDescription: "Mock short description A",
    Description: "Mock full description A",
    ImageURL: "",
    IsActive: true,
    RA: 0,
    Dec: 0,
  },
  {
    StarID: 2,
    StarName: "Mock Beta",
    ShortDescription: "Mock short description B",
    Description: "Mock full description B",
    ImageURL: "",
    IsActive: true,
    RA: 0,
    Dec: 0,
  },
  {
    StarID: 3,
    StarName: "Mock Gamma",
    ShortDescription: "Mock short description C",
    Description: "Mock full description C",
    ImageURL: "",
    IsActive: true,
    RA: 0,
    Dec: 0,
  },
];
////

const BASE_URL = "/api/stars";

// GET /api/stars?star_name=xxx
export async function getStars(starName?: string): Promise<Star[]> {
  try {
    const params = starName ? `?star_name=${encodeURIComponent(starName)}` : "";
    const res = await fetch(`${BASE_URL}${params}`);

    if (!res.ok) throw new Error("Backend error");
    return await res.json();
  } catch (e) {
    console.warn("Бэкенд недоступен, использую mock", e);

    if (!starName) return mockStars;

    return mockStars.filter((s) =>
      s.StarName.toLowerCase().includes(starName.toLowerCase())
    );
  }
}


// GET /api/stars/:id
export async function getStarById(id: number): Promise<Star> {
  try {
    const res = await fetch(`${BASE_URL}/${id}`);

    if (!res.ok) throw new Error("Ошибка получения звезды");

    return await res.json();
  } catch (e) {
    console.warn("Бэкенд недоступен, использую mock getStarById", e);

    // const found = mockStars.find((s) => s.StarID === id);

    return {
      StarID: id,
      StarName: "Mock Star By ID",
      ShortDescription: "Mock short description",
      Description: "Mock description",
      ImageURL: "",
      IsActive: true,
      RA: 0,
      Dec: 0,
    };
  }
}
