export type PollInput = {
  question: string;
  options: string[];
  maxSelections?: number;
  /**
   * Poll duration in seconds.
   * Channel-specific limits apply (e.g. Telegram open_period is 5-600s).
   */
  durationSeconds?: number;
  /**
   * Poll duration in hours.
   * Used by channels that model duration in hours (e.g. Discord).
   */
  durationHours?: number;
};

export type NormalizedPollInput = {
  question: string;
  options: string[];
  maxSelections: number;
  durationSeconds?: number;
  durationHours?: number;
};

type NormalizePollOptions = {
  maxOptions?: number;
  dedupeOptions?: boolean;
  autoClampMaxSelections?: boolean;
  autoClampDuration?: boolean;
};

export function resolvePollMaxSelections(
  optionCount: number,
  allowMultiselect: boolean | undefined,
): number {
  return allowMultiselect ? Math.max(2, optionCount) : 1;
}

export function normalizePollInput(
  input: PollInput,
  options: NormalizePollOptions = {},
): NormalizedPollInput {
  const dedupeOptions = options.dedupeOptions ?? true;
  const autoClampMaxSelections = options.autoClampMaxSelections ?? true;
  const autoClampDuration = options.autoClampDuration ?? true;
  const question = input.question.trim();
  if (!question) {
    throw new Error("Poll question is required");
  }
  const pollOptions = (input.options ?? []).map((option) => option.trim());
  const cleaned = pollOptions.filter(Boolean);
  const normalizedOptions = dedupeOptions
    ? cleaned.filter((option, index, allOptions) => {
        const normalized = option.toLocaleLowerCase();
        return (
          index === allOptions.findIndex((candidate) => candidate.toLocaleLowerCase() === normalized)
        );
      })
    : cleaned;
  if (normalizedOptions.length < 2) {
    throw new Error("Poll requires at least 2 options");
  }
  if (options.maxOptions !== undefined && normalizedOptions.length > options.maxOptions) {
    throw new Error(`Poll supports at most ${options.maxOptions} options`);
  }
  const maxSelectionsRaw = input.maxSelections;
  const maxSelectionsBase =
    typeof maxSelectionsRaw === "number" && Number.isFinite(maxSelectionsRaw)
      ? Math.floor(maxSelectionsRaw)
      : 1;
  const maxSelections = autoClampMaxSelections
    ? Math.min(Math.max(maxSelectionsBase, 1), normalizedOptions.length)
    : maxSelectionsBase;
  if (!autoClampMaxSelections && maxSelections < 1) {
    throw new Error("maxSelections must be at least 1");
  }
  if (!autoClampMaxSelections && maxSelections > normalizedOptions.length) {
    throw new Error("maxSelections cannot exceed option count");
  }

  const durationSecondsRaw = input.durationSeconds;
  const durationSecondsBase =
    typeof durationSecondsRaw === "number" && Number.isFinite(durationSecondsRaw)
      ? Math.floor(durationSecondsRaw)
      : undefined;
  const durationSeconds =
    autoClampDuration && durationSecondsBase !== undefined
      ? Math.max(1, durationSecondsBase)
      : durationSecondsBase;
  if (!autoClampDuration && durationSeconds !== undefined && durationSeconds < 1) {
    throw new Error("durationSeconds must be at least 1");
  }

  const durationRaw = input.durationHours;
  const durationHoursBase =
    typeof durationRaw === "number" && Number.isFinite(durationRaw)
      ? Math.floor(durationRaw)
      : undefined;
  const durationHours =
    autoClampDuration && durationHoursBase !== undefined
      ? Math.max(1, durationHoursBase)
      : durationHoursBase;
  if (!autoClampDuration && durationHours !== undefined && durationHours < 1) {
    throw new Error("durationHours must be at least 1");
  }
  if (durationSeconds !== undefined && durationHours !== undefined) {
    throw new Error("durationSeconds and durationHours are mutually exclusive");
  }
  return {
    question,
    options: normalizedOptions,
    maxSelections,
    durationSeconds,
    durationHours,
  };
}

export function normalizePollDurationHours(
  value: number | undefined,
  options: { defaultHours: number; maxHours: number },
): number {
  const base =
    typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : options.defaultHours;
  return Math.min(Math.max(base, 1), options.maxHours);
}
