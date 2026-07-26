import { NextResponse } from "next/server";
import { generatePdf } from "@/lib/generatePdf";

export async function POST(request: Request) {
  let markdown: string;
  let platform: string;
  let title: string | undefined;
  let author: string | undefined;
  let theme: string | undefined;

  try {
    const body = await request.json();
    markdown = body.markdown;
    platform = body.platform;
    title = body.title;
    author = body.author;
    theme = body.theme;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!markdown) {
    return NextResponse.json(
      { error: "Markdown content is required." },
      { status: 400 }
    );
  }

  try {
    console.log(`[api] Generating PDF for ${platform} (theme: ${theme})…`);
    const pdfBuffer = await generatePdf(markdown, platform, { title, author, theme });
    console.log(`[api] PDF generated: ${pdfBuffer.length} bytes`);

    const sanitizedTitle = title
      ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)
      : "study-notes";
    const filename = `chatnotes-${sanitizedTitle}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[api] PDF generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate the PDF." },
      { status: 500 }
    );
  }
}
