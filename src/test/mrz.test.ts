import { describe, it, expect } from "vitest";
import { parseMrz, computeCheckDigit, structureSection, expirySection, compareNames, parseMrzDate, extractionSection } from "@/lib/suite/mrz";

const TODAY = new Date("2026-10-05T00:00:00Z");
const TD3 = "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<\nL898902C36UTO7408122F1204159ZE184226B<<<<<10";
const TD1 = "I<UTOD231458907<<<<<<<<<<<<<<<\n7408122F1204159UTO<<<<<<<<<<<6\nERIKSSON<<ANNA<MARIA<<<<<<<<<<";
const TD2 = "I<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<\nD231458907UTO7408122F1204159<<<<<<<6";

describe("ICAO 9303 MRZ", () => {
  it("computes check digits", () => {
    expect(computeCheckDigit("L898902C3")).toBe(6);
    expect(computeCheckDigit("740812")).toBe(2);
  });

  it.each([["TD3", TD3], ["TD1", TD1], ["TD2", TD2]])("validates %s sample", (fmt, text) => {
    const r = parseMrz(text, TODAY);
    expect(r.format).toBe(fmt);
    expect(structureSection(r).status).toBe("passed");
    expect(r.fields!.surname).toBe("ERIKSSON");
    expect(r.fields!.givenNames).toBe("ANNA MARIA");
    expect(r.fields!.dateOfBirth.iso).toBe("1974-08-12");
    expect(r.fields!.sex).toBe("F");
  });

  it("flags an incorrect check digit without correcting it", () => {
    const bad = TD3.replace("L898902C36", "L898902C37");
    const r = parseMrz(bad, TODAY);
    expect(structureSection(r).status).toBe("failed");
    expect(r.fields!.documentNumber).toBe("L898902C3");
    expect(r.checks.find((c) => c.field === "Document number")!.status).toBe("failed");
  });

  it("flags expired documents", () => {
    expect(expirySection(parseMrz(TD3, TODAY), TODAY).status).toBe("failed");
  });

  it("flags ambiguous birth centuries", () => {
    expect(parseMrzDate("200101", "birth", TODAY).ambiguous).toBe(true);
    expect(parseMrzDate("800101", "birth", TODAY).ambiguous).toBe(false);
    expect(parseMrzDate("991301", "birth", TODAY).iso).toBeNull();
  });

  it("rejects bad characters and lengths", () => {
    expect(parseMrz("P<UTO0O\nabc").format).toBeNull();
    expect(parseMrz(TD3.replace("ERIKSSON", "ERIKSS0N").replace("<", "*")).ok).toBe(false);
  });

  it("marks OCR-sourced failures for review", () => {
    const r = parseMrz(TD3.replace("L898902C36", "L898902C37"), TODAY);
    expect(extractionSection(r, "upload").status).toBe("needs_review");
  });

  it("compares names with transliteration", () => {
    expect(compareNames("Anna María Eriksson", "ERIKSSON", "ANNA MARIA", false).status).toBe("passed");
    expect(compareNames("Jürgen Müller", "MUELLER", "JUERGEN", false).status).toBe("passed");
    expect(compareNames("John Smith", "ERIKSSON", "ANNA", false).status).toBe("failed");
  });
});
