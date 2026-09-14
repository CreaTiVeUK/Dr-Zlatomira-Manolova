import { CONSENT_KEY } from "@/lib/consent";

/**
 * Consent Mode v2 defaults, rendered as a plain inline script in <head>.
 *
 * This has to run before first paint and before gtag.js can possibly load,
 * for every visitor including one who has never seen the banner. A plain
 * server-rendered <script> is the only thing that guarantees that order —
 * next/script's strategies all execute later. All four signals start
 * "denied"; a returning visitor's stored "true" is replayed right here so
 * they are granted before the library loads, without waiting for hydration.
 *
 * The tag itself is loaded by GoogleTag.tsx. Both render nothing when
 * NEXT_PUBLIC_GA_ID is unset, so previews send nothing to production data.
 */
export default function GoogleConsentDefaults() {
    const id = process.env.NEXT_PUBLIC_GA_ID;
    if (!id) return null;
    // JSON.stringify guards the id and key against breaking out of the script.
    const js = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});
try{var c=localStorage.getItem(${JSON.stringify(CONSENT_KEY)});var d=navigator.doNotTrack==='1'||window.doNotTrack==='1'||navigator.globalPrivacyControl===true;
if(c==='true'&&!d){gtag('consent','update',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});}}catch(e){}
gtag('js',new Date());gtag('config',${JSON.stringify(id)});`;
    return <script id="google-consent-defaults" dangerouslySetInnerHTML={{ __html: js }} />;
}
