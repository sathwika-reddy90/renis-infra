// `icon` is a stable key mapped to an icon component in the UI layer,
// keeping data free of component references.
export interface Amenity {
  id: string;
  title: string;
  description: string;
  icon: string;
  category?: string;
}
