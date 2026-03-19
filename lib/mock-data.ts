import bcrypt from "bcryptjs";
import type { CareerConfig, Company, Job } from "@/types";

const defaultConfig: CareerConfig = {
  companyName: "Demo Company",
  tagline: "Build products that people love.",
  themeColor: "#0f766e",
  logoUrl: "",
  bannerUrl:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
  cultureVideoUrl: "",
  sections: [
    {
      id: "about-1",
      type: "about",
      title: "About Us",
      content:
        "We are a fast-moving team focused on simple products with real impact."
    },
    {
      id: "life-1",
      type: "life",
      title: "Life at Company",
      layout: "cards",
      content:
        "Ownership mindset\nHigh trust culture\nLearning budget and mentorship"
    }
  ]
};

const hashedPassword = bcrypt.hashSync("demo123", 8);

export const mockCompanies: Company[] = [
  {
    id: "demo-id",
    slug: "demo-company",
    name: "Demo Company",
    adminEmail: "admin@demo.com",
    passwordHash: hashedPassword,
    isPublished: true,
    draftVersion: 0,
    draftConfig: defaultConfig,
    publishedConfig: defaultConfig
  }
];

export const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "Frontend Engineer",
    location: "Bengaluru",
    workType: "Hybrid",
    employmentType: "Full-time",
    salary: "18L - 24L",
    experienceLevel: "2-4 years",
    keyResponsibilities:
      "Build reusable UI components\nCollaborate with product and design\nImprove performance and accessibility",
    techStack: "Next.js, React, TypeScript, Tailwind CSS",
    postedAt: new Date().toISOString(),
    description: "Build modern interfaces using React and Next.js."
  },
  {
    id: "job-2",
    title: "Product Design Intern",
    location: "Remote",
    workType: "Remote",
    employmentType: "Intern",
    salary: "Stipend",
    experienceLevel: "0-1 years",
    keyResponsibilities: "Support design research\nCreate wireframes\nHelp maintain design system",
    techStack: "Figma, FigJam, Notion",
    postedAt: new Date().toISOString(),
    description: "Design polished user experiences for web products."
  }
];
