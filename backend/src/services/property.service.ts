import { BaseService } from "./base.service";
import {
  propertyRepository,
  type PropertyFacets,
  type PropertySearchResult,
} from "../repositories/property.repository";
import type {
  Property,
  PropertyCreateInput,
  PropertyListQuery,
  PropertyUpdateInput,
} from "../types/property";

/**
 * Extends the generic CRUD service with the read paths the public site needs.
 * `BaseService.list()` deliberately stays untouched (and unused for this
 * resource) so the shared CRUD contract is unchanged for everything else.
 */
class PropertyService extends BaseService<Property, PropertyCreateInput, PropertyUpdateInput> {
  search(query: PropertyListQuery): Promise<PropertySearchResult> {
    return propertyRepository.search(query);
  }

  related(slug: string, limit: number): Promise<Property[]> {
    return propertyRepository.related(slug, limit);
  }

  facets(): Promise<PropertyFacets> {
    return propertyRepository.facets();
  }
}

export const propertyService = new PropertyService(propertyRepository, "Property");
