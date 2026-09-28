import { derivePlatforms, parsePlatforms, serializePlatforms } from "../platforms";

describe("derivePlatforms", () => {
  it("maps portal screens to Riftbound", () => {
    expect(derivePlatforms("P-01, P-02, P-03")).toEqual(["riftbound"]);
    expect(derivePlatforms("P-11")).toEqual(["riftbound"]);
    expect(derivePlatforms("Global")).toEqual(["riftbound"]);
  });

  it("maps the OneVenue backoffice (P-12) to SmartVenues", () => {
    expect(derivePlatforms("P-12")).toEqual(["smartvenues"]);
  });

  it("returns both when a requirement spans portal and backoffice", () => {
    expect(derivePlatforms("P-02, P-12")).toEqual(["riftbound", "smartvenues"]);
  });

  it("treats a requirement without page as a platform integration", () => {
    expect(derivePlatforms("—")).toEqual(["smartvenues"]);
    expect(derivePlatforms(null)).toEqual(["smartvenues"]);
  });
});

describe("parsePlatforms / serializePlatforms", () => {
  it("round-trips in canonical order and drops unknown keys", () => {
    const raw = serializePlatforms(["smartvenues", "riftbound"]);
    expect(raw).toBe('["riftbound","smartvenues"]');
    expect(parsePlatforms('["smartvenues","nope"]')).toEqual(["smartvenues"]);
  });

  it("is lenient with empty or malformed values", () => {
    expect(parsePlatforms(null)).toEqual([]);
    expect(parsePlatforms("not json")).toEqual([]);
  });
});
