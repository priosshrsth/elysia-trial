export type IObjValues<T extends Readonly<Record<string, unknown>>> = T[keyof T];
