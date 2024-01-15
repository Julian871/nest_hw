export class BlogCreator {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

  constructor(name: string, description: string, websiteUrl: string) {
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
    this.createdAt = new Date().toISOString();
    this.isMembership = false;
  }
}
