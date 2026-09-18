import { publicSiteUrl } from "@/lib/monthlyTransferEmailHtml";

const CORAL = "#FE4B60";
const NAVY = "#001E3A";
const TEAL = "#007A8B";
const CREAM = "#F7F9FC";
const MUTED = "#5C6B7A";

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export function buildMagicLinkEmailText(url: string): string {
  return [
    "Sign in to 1p Challenge Calculator",
    "",
    "Tap the link below to sign in. It expires soon.",
    url,
    "",
    "If you didn't request this, you can ignore this email.",
  ].join("\n");
}

export function buildMagicLinkEmailHtml(url: string): string {
  const site = publicSiteUrl();
  const href = escapeAttr(url);
  const siteHref = escapeAttr(site);
  const emblem = `${siteHref}/Monzo-Emblem-Light.png`;
  const wordmark = `${siteHref}/Monzo_logo.png`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Sign in · 1p Challenge</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet" />
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; }
    @media (prefers-color-scheme: dark) {
      .bg-page { background-color: #00101f !important; }
      .bg-card { background-color: #002338 !important; }
      .text-body { color: #f0f4f8 !important; }
      .text-muted { color: #8b9eac !important; }
    }
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; }
      .px { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body class="bg-page" style="margin:0;padding:0;background-color:${CREAM};">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    Your magic link to sign in to 1p Challenge Calculator.
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="bg-page" style="background-color:${CREAM};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px;max-width:600px;">
          <tr>
            <td style="padding:0 0 16px 0;text-align:center;">
              <a href="${siteHref}" style="text-decoration:none;">
                <img src="${emblem}" width="48" height="48" alt="Monzo" style="display:inline-block;width:48px;height:48px;border-radius:12px;" />
              </a>
            </td>
          </tr>
          <tr>
            <td class="bg-card" style="background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(0,30,58,0.10);">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="background-color:${NAVY};background-image:linear-gradient(160deg,#001E3A 0%,#003058 55%,#007A8B 140%);padding:28px 32px 24px 32px;" class="px">
                    <p style="margin:0 0 6px 0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${CORAL};">
                      1p Challenge
                    </p>
                    <h1 style="margin:0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:22px;line-height:28px;font-weight:800;color:#ffffff;">
                      Your magic link is ready
                    </h1>
                    <p style="margin:8px 0 0 0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:22px;color:#c5d4e0;">
                      Sign in with one tap — no password needed
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="height:6px;line-height:6px;font-size:0;background-color:${CORAL};">&nbsp;</td>
                </tr>
                <tr>
                  <td class="px text-body" style="padding:32px 32px 8px 32px;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;color:${NAVY};text-align:center;">
                    Tap the button below to sign in to your 1p Challenge Calculator account. This link expires soon.
                  </td>
                </tr>
                <tr>
                  <td class="px" align="center" style="padding:24px 32px 12px 32px;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${href}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="50%" fillcolor="${CORAL}" stroke="f">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;">Sign in</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${href}" style="display:inline-block;background-color:${CORAL};color:#ffffff;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:999px;line-height:20px;">
                      Sign in
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
                <tr>
                  <td class="px text-muted" style="padding:8px 32px 36px 32px;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:${MUTED};text-align:center;">
                    If you didn’t ask to sign in, you can ignore this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 16px 8px 16px;text-align:center;">
              <img src="${wordmark}" width="96" height="22" alt="Monzo" style="display:inline-block;height:22px;width:auto;opacity:0.75;" />
              <p class="text-muted" style="margin:10px 0 0 0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:11px;line-height:18px;color:${MUTED};">
                Inspired by Monzo’s 1p challenge.
              </p>
              <p style="margin:8px 0 0 0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:11px;line-height:18px;">
                <a href="${siteHref}" style="color:${TEAL};text-decoration:none;">1p Challenge Calculator</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendMagicLinkEmail(opts: {
  to: string;
  url: string;
  from: string;
  apiKey: string;
}): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: opts.from,
      to: opts.to,
      subject: "Sign in to 1p Challenge Calculator",
      html: buildMagicLinkEmailHtml(opts.url),
      text: buildMagicLinkEmailText(opts.url),
    }),
  });

  if (!res.ok) {
    throw new Error("Resend error: " + JSON.stringify(await res.json()));
  }
}
