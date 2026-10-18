import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { enterpriseOrgNameFor } from "./orgCreationPolicy.ts";

Deno.test("gmail learner never gets an organisation", () => {
  assertEquals(enterpriseOrgNameFor("jane@gmail.com", "Jane Ltd"), null);
});
Deno.test("company email without a company name gets none", () => {
  assertEquals(enterpriseOrgNameFor("jane@acme.com", ""), null);
});
Deno.test("company name that is just a domain is rejected", () => {
  assertEquals(enterpriseOrgNameFor("jane@acme.com", "acme.com"), null);
});
Deno.test("company email plus real company name qualifies", () => {
  assertEquals(enterpriseOrgNameFor("jane@acme.com", "Acme Bank"), "Acme Bank");
});
