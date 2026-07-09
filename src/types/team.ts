export interface TeamSocials {
  linkedin?: string;
  twitter?: string;
  email?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio?: string;
  socials?: TeamSocials;
}
