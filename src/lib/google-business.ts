/**
 * The practice's Google Business Profile (the Maps listing), in the two forms
 * Google's URLs accept. Both are stable: unlike the /maps/place/<name>/ URL,
 * neither changes when the listing's name or address is edited.
 *
 * Verified 2026-09-29 — both resolve to
 * "АИПСМП по Педиатрия „Д-р Златомира Манолова-Пенева“", and the CID matches
 * the place hash already embedded in the contact page's map iframe
 * (0x72238a6c53395303 = 8224569542366024451).
 */

/** Place ID — what the Maps URLs API takes as destination_place_id. */
export const GOOGLE_PLACE_ID = "ChIJr14nWtfRrBQRA1M5U2yKI3I";

/** Customer ID URL — the canonical link to the listing itself. */
export const GOOGLE_BUSINESS_PROFILE_URL = "https://www.google.com/maps?cid=8224569542366024451";

/**
 * Turn-by-turn directions to the listing, not to bare coordinates.
 *
 * Routing to the place ID is what makes Google count the click as a
 * directions request for the Business Profile — one of the engagement
 * signals it uses when ranking the listing in local results. A coordinate
 * destination navigates to the same spot but credits nothing. The
 * coordinates stay as `destination` because the API requires it; the place
 * ID takes precedence when both are present.
 *
 * Keep "google.com/maps/dir" in the URL: ConsentedAnalytics matches on that
 * substring to report the directions_click event.
 */
export const DIRECTIONS_URL =
    "https://www.google.com/maps/dir/?api=1&destination=42.136959,24.790681" +
    `&destination_place_id=${GOOGLE_PLACE_ID}`;
