import { getSiteLink } from "@/lib/site";

export function GET() {
  const content = `# Shantel Kisi\n\n> Portfolio of Shantel Kisi, a Computer Science MSc graduate focused on software engineering, data, machine learning, and AI.\n\nThis site presents project demonstrations and an interactive portfolio. Project descriptions are authored by Shantel; visitors should consult each project page for scope and limitations.\n\n## Portfolio\n- [Home and project overview](${getSiteLink("/")})\n- [Interactive banking demo](${getSiteLink("/banking-demo")}) — browser-based showcase using fictional records stored locally in the visitor's browser; it is not a real banking service.\n\n## Featured projects\n- Water Support Without Barriers — local-first prototype for organising water bills and letters, checking details, and saving next steps.\n- Environmental intelligence system — data, machine learning, and geospatial decision-support project.\n- From raw data to useful answers — SQL and relational data pipeline case study.\n- Banking and account management — fictional-data interactive portfolio simulation.\n- Storm Overflow Dashboard — environmental monitoring and data visualisation demonstration.\n\n## Notes\n- The projects are portfolio demonstrations; read the site for each project's status and limitations.\n- No real customer, banking, or water-provider data is used by the interactive banking demo.\n- Contact and social links are published only when configured on the portfolio.\n`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
