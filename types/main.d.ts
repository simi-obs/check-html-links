export interface Link {
  value: string;
  attribute: string;
  htmlFilePath: string;
  line: number;
  character: number;
}

export interface Usage {
  attribute: string;
  value: string;
  anchor: string;
  file: string;
  line: number;
  character: number;
}

export interface LocalFile {
  filePath: string;
  usage: Usage[];
}

export interface ExternalLink {
  link: string;
  usage: Usage[];
}

export interface Error {
  filePath: string;
  onlyAnchorMissing: boolean;
  usage: Usage[];
}

interface Options {
  ignoreLinkPatterns: string[] | null;
  considerPrefixAsLocal: string;
}

export interface CheckHtmlLinksCliOptions {
  printOnError: boolean;
  rootDir: string;
  ignoreLinkPatterns: string[] | null;
  continueOnError: boolean;
  showExternalLinks: boolean;
  maxReferencesPerError: number;
  considerPrefixAsLocal: string;
}
