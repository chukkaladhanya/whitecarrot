export type SectionType = "about" | "life";

export type LifeLayout = "text" | "gallery" | "cards";
export type SectionDirection = "grid" | "list";

export type SectionItem = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  caption?: string;
};

export type BuilderSection = {
  id: string;
  type: SectionType;
  title: string;
  content: string;
  layout?: LifeLayout;
  direction?: SectionDirection;
  items?: SectionItem[];
};

export type CareerConfig = {
  companyName: string;
  tagline: string;
  themeColor: string;
  logoUrl: string;
  bannerUrl: string;
  cultureVideoUrl: string;
  sections: BuilderSection[];
};

export type Job = {
  id: string;
  title: string;
  location: string;
  workType: "Remote" | "Hybrid" | "On-site" | "Office";
  employmentType: "Full-time" | "Contract" | "Part-time" | "Intern";
  salary: string;
  experienceLevel: string;
  description: string;
  keyResponsibilities?: string;
  techStack?: string;
  postedAt: string;
};

export type Company = {
  id: string;
  slug: string;
  name: string;
  adminEmail: string;
  passwordHash: string;
  isPublished: boolean;
  draftVersion: number;
  draftConfig: CareerConfig;
  publishedConfig: CareerConfig | null;
};
