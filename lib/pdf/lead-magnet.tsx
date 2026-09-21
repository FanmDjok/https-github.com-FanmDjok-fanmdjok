import "server-only";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { LeadMagnetSection } from "@/lib/supabase/types";

function styles(brandColor: string) {
  return StyleSheet.create({
    page: { padding: 48, fontSize: 11, color: "#121413", fontFamily: "Helvetica" },
    header: { marginBottom: 28 },
    brandBar: { width: 40, height: 6, backgroundColor: brandColor, marginBottom: 14 },
    orgName: { fontSize: 10, color: "#6E736F", marginBottom: 6 },
    title: { fontSize: 22, marginBottom: 4 },
    section: { marginBottom: 18 },
    sectionTitle: { fontSize: 13, marginBottom: 6, color: brandColor },
    sectionBody: { lineHeight: 1.5, color: "#121413" },
    footer: { position: "absolute", bottom: 32, left: 48, right: 48, fontSize: 9, color: "#6E736F" },
  });
}

function LeadMagnetDocument({
  title,
  sections,
  orgName,
  brandColor,
}: {
  title: string;
  sections: LeadMagnetSection[];
  orgName: string;
  brandColor: string;
}) {
  const s = styles(brandColor);
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.brandBar} />
          <Text style={s.orgName}>{orgName}</Text>
          <Text style={s.title}>{title}</Text>
        </View>

        {sections.map((section, i) => (
          <View key={i} style={s.section}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <Text style={s.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <Text style={s.footer} fixed>
          Réalisé avec growthis — {orgName}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderLeadMagnetPdf(params: {
  title: string;
  sections: LeadMagnetSection[];
  orgName: string;
  brandColor: string;
}): Promise<Buffer> {
  return renderToBuffer(<LeadMagnetDocument {...params} />);
}
