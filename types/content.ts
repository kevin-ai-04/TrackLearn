export interface ContentMeta {
  title: string;
  order?: number;
  description?: string;
}

export interface HeadingItem {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

export interface ModuleSummary extends ContentMeta {
  slug: string;
  subjectSlug: string;
  subjectTitle: string;
  headings: HeadingItem[];
  href: string;
}

export interface ModuleContent extends ModuleSummary {
  content: string;
}

export interface MaterialSummary extends ContentMeta {
  slug: string;
  subjectSlug: string;
  subjectTitle: string;
  headings: HeadingItem[];
  href: string;
}

export interface MaterialContent extends MaterialSummary {
  content: string;
}

export interface SubjectSummary extends ContentMeta {
  slug: string;
  materials: MaterialSummary[];
  modules: ModuleSummary[];
}

export interface SubjectContent extends ContentMeta {
  slug: string;
  materials: MaterialContent[];
  modules: ModuleContent[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
