/**
 * Contactadres van de beheerder. Staat bewust alleen server-side, zodat het
 * nergens in de website-broncode of het browserbundel zichtbaar is.
 */
export function contactEmail(): string {
  return process.env["CONTACT_EMAIL"] ?? "bvanderlint@gmail.com";
}
