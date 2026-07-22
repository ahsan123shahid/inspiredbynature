type NoteCategory = {
  name: string;
  notes: string[];
};

type NotesPyramidProps = {
  top: string[];
  middle: string[];
  base: string[];
};

export default function NotesPyramid({ top, middle, base }: NotesPyramidProps) {
  const categories: NoteCategory[] = [
    { name: "Top Notes", notes: top },
    { name: "Heart Notes", notes: middle },
    { name: "Base Notes", notes: base },
  ];

  return (
    <div className="py-6">
      <h3 className="font-semibold mb-4">Fragrance Notes</h3>
      <div className="flex flex-col items-center gap-0">
        {categories.map((cat, i) => (
          <div
            key={cat.name}
            className={`
              w-full max-w-xs text-center py-4 px-6
              ${i === 0 ? "bg-shade-20 rounded-t-lg" : ""}
              ${i === 1 ? "bg-shade-30" : ""}
              ${i === 2 ? "bg-shade-40 text-on-primary rounded-b-lg" : ""}
            `}
          >
            <p className="text-xs uppercase tracking-wider mb-1">{cat.name}</p>
            <p className="text-sm">{cat.notes.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
