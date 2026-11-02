import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import StudyApp from "@/components/databricks/StudyApp";
import { buildSections, getStudyTree } from "@/lib/studyTree";
import styles from "./theme.module.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const EXAM = "genai-engineer-associate";

export default async function DatabricksPage() {
  const rows = await getStudyTree(EXAM);
  const examRow = rows.find((r) => r.level === "exam");
  const sections = buildSections(rows);
  const totalTopics = sections.reduce((n, s) => n + s.totalCount, 0);
  const doneTopics = sections.reduce((n, s) => n + s.doneCount, 0);

  return (
    <div
      className={`${styles.theme} ${bricolage.variable} ${plexSans.variable} ${plexMono.variable} rounded-2xl p-4 sm:p-6`}
    >
      <StudyApp
        examTitle={examRow?.title ?? "Certification study tracker"}
        examMeta={examRow?.notes ?? null}
        sections={sections}
        totalTopics={totalTopics}
        doneTopics={doneTopics}
      />
    </div>
  );
}
