import type { RangeResult } from "@/lib/pennyChallenge";
import { formatPenceAsGBP } from "@/lib/pennyChallenge";

const CORAL = "#FE4B60";
const NAVY = "#001E3A";
const TEAL = "#007A8B";
const GREEN = "#4BB78F";
const CREAM = "#F7F9FC";
const MUTED = "#5C6B7A";

export function publicSiteUrl(): string {
  return (
    process.env.AUTH_URL ?? "https://monzo-1p-challenge-calculator.online"
  ).replace(/\/$/, "");
}

type HtmlOpts = {
  monthLabel: string;
  result: RangeResult;
  siteUrl?: string;
};

/**
 * Table-based, inline-styled HTML for Gmail / Apple Mail / Outlook.
 * Images are absolute URLs to files in /public.
 */
export function buildMonthlyTransferEmailHtml(opts: HtmlOpts): string {
  const { monthLabel, result } = opts;
  const site = (opts.siteUrl ?? publicSiteUrl()).replace(/\/$/, "");
  const amount = formatPenceAsGBP(result.totalPence);
  const first = formatPenceAsGBP(result.firstDayPence);
  const last = formatPenceAsGBP(result.lastDayPence);
  const emblem = `${site}/Monzo-Emblem-Light.png`;
  const wordmark = `${site}/Monzo_logo.png`;
  const preheader = `Transfer ${amount} into your Monzo pot for ${monthLabel}. Days ${result.firstDay}–${result.lastDay}.`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>1p Challenge · ${monthLabel}</title>
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
      .bg-stat { background-color: #002b4a !important; }
    }
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; }
      .px { padding-left: 20px !important; padding-right: 20px !important; }
      .amount { font-size: 36px !important; line-height: 42px !important; }
      .stat { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body class="bg-page" style="margin:0;padding:0;background-color:${CREAM};">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${preheader}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="bg-page" style="background-color:${CREAM};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px;max-width:600px;">
          <tr>
            <td style="padding:0 0 16px 0;text-align:center;">
              <a href="${site}" style="text-decoration:none;">
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
                      Time to top up your pot
                    </h1>
                    <p style="margin:8px 0 0 0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:22px;color:#c5d4e0;">
                      ${monthLabel}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="height:6px;line-height:6px;font-size:0;background-color:${CORAL};">&nbsp;</td>
                </tr>
                <tr>
                  <td class="px" style="padding:32px 32px 8px 32px;text-align:center;">
                    <p class="text-muted" style="margin:0 0 8px 0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:14px;color:${MUTED};">
                      Transfer this into Monzo today
                    </p>
                    <p class="amount" style="margin:0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:48px;line-height:54px;font-weight:800;letter-spacing:-0.03em;color:${CORAL};">
                      ${amount}
                    </p>
                    <p class="text-body" style="margin:10px 0 0 0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:15px;color:${NAVY};">
                      into your Monzo pot
                    </p>
                  </td>
                </tr>
                <tr>
                  <td class="px" style="padding:24px 32px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        ${statCell("Days", String(result.dayCount), `${result.firstDay}–${result.lastDay}`, TEAL)}
                        ${statCell("First day", first, `Day ${result.firstDay}`, CORAL)}
                        ${statCell("Last day", last, `Day ${result.lastDay}`, GREEN)}
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="px" align="center" style="padding:8px 32px 36px 32px;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${site}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="50%" fillcolor="${CORAL}" stroke="f">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;">Open calculator</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${site}" style="display:inline-block;background-color:${CORAL};color:#ffffff;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:999px;line-height:20px;">
                      Open calculator
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 16px 8px 16px;text-align:center;">
              <img src="${wordmark}" width="96" height="22" alt="Monzo" style="display:inline-block;height:22px;width:auto;opacity:0.75;" />
              <p class="text-muted" style="margin:10px 0 0 0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:11px;line-height:18px;color:${MUTED};">
                Inspired by Monzo’s 1p challenge. This is not financial advice.
              </p>
              <p style="margin:8px 0 0 0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:11px;line-height:18px;">
                <a href="${site}" style="color:${TEAL};text-decoration:none;">1p Challenge Calculator</a>
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

function statCell(
  label: string,
  value: string,
  hint: string,
  accent: string
): string {
  return `<td class="stat" width="33%" valign="top" style="padding:4px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td class="bg-stat" style="background-color:#EEF3F8;border-radius:14px;padding:14px 10px;text-align:center;border-top:3px solid ${accent};">
          <p style="margin:0 0 4px 0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">${label}</p>
          <p class="text-body" style="margin:0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:18px;font-weight:800;color:${NAVY};">${value}</p>
          <p class="text-muted" style="margin:4px 0 0 0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:11px;color:${MUTED};">${hint}</p>
        </td>
      </tr>
    </table>
  </td>`;
}
