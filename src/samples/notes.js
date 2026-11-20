if (import.meta.env.PROD) {
  console.error("Sample content was included in the production bundle.");
  throw new Error("Sample content was included in the production bundle.");
}

const picture = (seed, width, height) => `https://picsum.photos/seed/bndlabs-note-${seed}/${width}/${height}`;

const paragraph = (text) => ({ type: "text", html: `<p>${text}</p>` });
const heading = (text) => ({ type: "heading", text });
const image = (seed, width, height, caption) => ({
  type: "image",
  url: picture(seed, width, height),
  alt: caption,
  caption,
});

export const sampleNotes = [
  {
    sample: true,
    id: "sample-finding-the-shape",
    slug: "sample-finding-the-shape",
    title: "Sample: Finding the shape of a product",
    excerpt: "A long sample note for checking the notes layout. It is demo writing, not a published essay.",
    description: "A long sample note for checking the notes layout. It is demo writing, not a published essay.",
    thumb_url: picture("cover", 1600, 1000),
    date: "2026-03-12",
    read_time: "8 min read",
    tag: "Sample",
    author: { name: "Bodunde Emmanuel" },
    content_blocks: [
      paragraph("This note is sample writing. It is here so the notes page, the article, the pictures, and the share row can be reviewed before real notes are published."),
      heading("Start with the job"),
      paragraph("A product page should say what the thing does before it says how it looks. The first screen has one job: help a person understand where they are and what they can do next. If that screen tries to explain the whole system, it usually explains nothing."),
      image("desk", 1600, 1000, "Sample photograph of a working desk."),
      paragraph("I write the first line as if I were telling a friend. Then I cut the words that only repeat the title. What is left should still make sense if the picture failed to load."),
      heading("Look at the hard moment"),
      paragraph("The useful part of a study is rarely the hero image. It is the moment someone hesitates. They cannot tell if a seller is real. They cannot find the price. They cannot get back to the list. Those moments deserve a screen of their own."),
      image("street", 1200, 800, "Sample photograph of a street."),
      image("hands", 1200, 800, "Sample photograph of hands at a table."),
      paragraph("When I lay those screens out, I keep them the same size and I put them in the order a person would meet them. A gallery that jumps from a wide poster to a tiny icon, with no order, makes the work look unfinished even when the screens are fine."),
      heading("Write the interface"),
      paragraph("Buttons should say the action. Empty states should say what creating the first item does. Errors should say how to fix the problem. I try the same line in English, then I ask how I would say it in Yoruba and in Nigerian Pidgin. If one of those versions is clearer, the English was too stiff."),
      image("type", 1600, 900, "Sample photograph of printed type."),
      paragraph("A long paragraph is not a sign of care. Care is knowing which sentence can go. This sample keeps a few long ones on purpose, so the article measure, the heading size, and the space around pictures can be checked."),
      heading("Pictures in the piece"),
      paragraph("Pictures in a note should sit in the column, with the same side space as the text. A wide picture can take the column. Two smaller ones can sit together when the page is wide, and stack when it is narrow. The caption, when there is one, belongs to the picture and not to the paragraph above it."),
      image("paper", 1400, 900, "Sample photograph of paper and tools."),
      image("screen", 900, 1400, "Sample photograph of a screen."),
      paragraph("The pictures in this note are placeholders from a public image service. They are not project photography, and they are not part of the portfolio work."),
      heading("What to check"),
      paragraph("Read this on a wide window and on a phone. The title, the date, the headings, the pictures, and the share row at the end should all sit inside the same left and right padding. Nothing in the article should touch the edge of the screen."),
      {
        type: "callout",
        title: "Sample",
        body: "This note is demo content for the layout. Replace it when a real note is ready.",
      },
    ],
  },
  {
    sample: true,
    id: "sample-a-shorter-note",
    slug: "sample-a-shorter-note",
    title: "Sample: A shorter note",
    excerpt: "A second sample note, so the notes list and the related notes can be checked.",
    description: "A second sample note, so the notes list and the related notes can be checked.",
    thumb_url: picture("short", 1400, 900),
    date: "2026-02-02",
    read_time: "3 min read",
    tag: "Sample",
    author: { name: "Bodunde Emmanuel" },
    content_blocks: [
      paragraph("This shorter sample exists so the notes list is not a single card, and so a note can offer another note at the end."),
      heading("One idea"),
      paragraph("If a note has one idea, the page should still feel finished. A heading, a paragraph, and one picture are enough to see the type, the spacing, and the frame."),
      image("one", 1400, 900, "Sample photograph for the short note."),
      paragraph("The share row still belongs at the end, after the writing and before anything that points to another note."),
    ],
  },
];
