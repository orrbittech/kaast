type ParsedDiscPayload = {
  registration: string;
  vin?: string;
  make?: string;
  model?: string;
  raw: string;
};

function normalizePlate(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function findByLabel(raw: string, labels: string[]): string | undefined {
  const lines = raw.split(/\r?\n/).map((line) => line.trim());
  for (const line of lines) {
    for (const label of labels) {
      const idx = line.toLowerCase().indexOf(label.toLowerCase());
      if (idx >= 0) {
        const value = line.slice(idx + label.length).replace(/^[:\s-]+/, "").trim();
        if (value) return value;
      }
    }
  }
  return undefined;
}

export function parseDiscPayload(payload: string): ParsedDiscPayload | null {
  const raw = payload.trim();
  if (!raw) return null;

  const registrationCandidate =
    findByLabel(raw, ["registration", "reg no", "license no", "licence no"]) ??
    raw.split(/\s+/).find((token) => /^[A-Z0-9]{4,10}$/.test(token.toUpperCase()));

  if (!registrationCandidate) return null;

  const vinCandidate = findByLabel(raw, ["vin"]);
  const makeCandidate = findByLabel(raw, ["make"]);
  const modelCandidate = findByLabel(raw, ["model", "description"]);

  return {
    registration: normalizePlate(registrationCandidate),
    vin: vinCandidate,
    make: makeCandidate,
    model: modelCandidate,
    raw,
  };
}
