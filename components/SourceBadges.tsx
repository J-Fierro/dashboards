import { Badge } from "./ui";

export function SourceBadges({ mock }: { mock: boolean }) {
  return (
    <>
      {mock && <Badge tone="amber">Testdaten</Badge>}
      <Badge>Meta Ads</Badge>
    </>
  );
}

export function sourceLabel(mock: boolean, termineSource: string) {
  const meta = mock ? "Ads-Manager-Export (Testdaten)" : "Meta Ads";
  const sheets = termineSource === "sheet" ? " + Google Sheets" : termineSource === "fixture" ? " + lokale Lead-Liste" : "";
  return meta + sheets;
}
