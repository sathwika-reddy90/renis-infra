"use client";

import { useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { Copy, Eye, Wand2, ExternalLink } from "lucide-react";
import Modal from "@/components/admin/Modal";
import ResourceCrud from "@/components/admin/ResourceCrud";
import { FilterSelect } from "@/components/admin/DataTable";
import { IconButton, Badge } from "@/components/admin/ui";
import {
  TextField,
  TextareaField,
  SelectField,
  TagsField,
  CheckField,
  FieldGrid,
  FormSection,
  ArrayItem,
  AddItemButton,
} from "@/components/admin/form/fields";
import { MediaPickerField, MediaPickerListField } from "@/components/admin/form/MediaPickerField";
import { adminApi } from "@/lib/admin/api";
import { useCrudMutations } from "@/lib/admin/hooks";
import { slugify } from "@/lib/admin/format";
import { propertySchema, type PropertyInput } from "@/lib/admin/schemas";
import {
  PROPERTY_TYPES,
  PROPERTY_STATUSES,
  type AdminProperty,
  type PropertyStatusValue,
} from "@/lib/admin/types";

const STATUS_TONE: Record<PropertyStatusValue, "gold" | "green" | "blue" | "neutral" | "red"> = {
  NEW_LAUNCH: "gold",
  NOW_SELLING: "green",
  READY_TO_MOVE: "blue",
  COMING_SOON: "neutral",
  SOLD_OUT: "red",
};

const label = (v: string) => v.replaceAll("_", " ");

/* --------------------------------- form ------------------------------------ */

function Fields({ form }: { form: UseFormReturn<PropertyInput> }) {
  const { register, control, setValue, watch, formState: { errors } } = form;

  const floorPlans = useFieldArray({ control, name: "floorPlans" });
  const specifications = useFieldArray({ control, name: "specifications" });
  const paymentPlans = useFieldArray({ control, name: "paymentPlans" });
  const landmarks = useFieldArray({ control, name: "nearbyLandmarks" });
  const stats = useFieldArray({ control, name: "overviewStats" });
  const highlights = useFieldArray({ control, name: "highlights" });

  return (
    <>
      <FormSection title="Basics">
        <TextField label="Title" error={errors.title?.message} {...register("title")} />
        <div className="flex items-end gap-2">
          <TextField label="Slug" error={errors.slug?.message} className="flex-1" {...register("slug")} />
          <button
            type="button"
            onClick={() => setValue("slug", slugify(watch("title")), { shouldValidate: true })}
            className="flex h-10 items-center gap-1.5 border border-line px-3 text-[0.62rem] uppercase tracking-[0.14em] text-muted transition-colors hover:border-gold hover:text-gold"
          >
            <Wand2 size={12} /> Generate
          </button>
        </div>
        <TextField label="Subtitle" error={errors.subtitle?.message} {...register("subtitle")} />
        <TextareaField label="Description" rows={4} error={errors.description?.message} {...register("description")} />
        <FieldGrid>
          <SelectField
            label="Status"
            options={PROPERTY_STATUSES.map((s) => ({ value: s, label: label(s) }))}
            error={errors.status?.message}
            {...register("status")}
          />
          <SelectField
            label="Property type"
            options={PROPERTY_TYPES.map((t) => ({ value: t, label: label(t) }))}
            error={errors.propertyType?.message}
            {...register("propertyType")}
          />
        </FieldGrid>
      </FormSection>

      <FormSection title="Location">
        <TextField label="Location / Address" error={errors.location?.message} {...register("location")} />
        <FieldGrid>
          <TextField label="City" error={errors.city?.message} {...register("city")} />
          <TextField label="State" error={errors.state?.message} {...register("state")} />
        </FieldGrid>
        <FieldGrid>
          <TextField label="Latitude" type="number" step="any" error={errors.lat?.message} {...register("lat")} />
          <TextField label="Longitude" type="number" step="any" error={errors.lng?.message} {...register("lng")} />
        </FieldGrid>
      </FormSection>

      <FormSection title="Pricing & Configuration">
        <FieldGrid>
          <TextField label="Price (₹)" type="number" min={0} error={errors.price?.message} {...register("price")} />
          <TextField label="Price label" placeholder="₹ 8.4 Cr onwards" error={errors.priceLabel?.message} {...register("priceLabel")} />
        </FieldGrid>
        <FieldGrid>
          <TextField label="Bedrooms" placeholder="4 & 5 BHK" error={errors.bedrooms?.message} {...register("bedrooms")} />
          <TextField label="Bathrooms" type="number" min={0} error={errors.bathrooms?.message} {...register("bathrooms")} />
        </FieldGrid>
        <FieldGrid>
          <TextField label="Area" placeholder="4,200 – 6,800 sq.ft." error={errors.area?.message} {...register("area")} />
          <TextField label="Possession" placeholder="Q4 2028" error={errors.possession?.message} {...register("possession")} />
        </FieldGrid>
        <FieldGrid>
          <TextField label="RERA number" error={errors.reraNumber?.message} {...register("reraNumber")} />
          <TextField label="Developer" error={errors.developer?.message} {...register("developer")} />
        </FieldGrid>
        <MediaPickerField
          control={control}
          name="developerLogo"
          label="Developer logo (optional)"
          hint="Shown alongside the developer name in the project specs"
        />
        <TagsField
          control={control}
          name="certifications"
          label="Certifications"
        />
      </FormSection>

      <FormSection
        title="Placement"
        description="Controls where and in what order this project appears across the site."
      >
        <CheckField
          label="Feature on the homepage"
          {...register("featured")}
        />
        <TextField
          label="Display order"
          type="number"
          min={0}
          hint="Lower numbers sort first; ties fall back to newest."
          error={errors.order?.message}
          {...register("order")}
        />
      </FormSection>

      <FormSection title="Media">
        <MediaPickerField control={control} name="featuredImage" label="Featured image" />
        <MediaPickerListField
          control={control}
          name="heroImages"
          label="Hero slider images"
        />
        <MediaPickerListField control={control} name="gallery" label="Gallery images" />
        <FieldGrid>
          <TextField label="Video URL (optional)" error={errors.video?.message} {...register("video")} />
          <TextField label="Virtual tour URL (optional)" error={errors.virtualTour?.message} {...register("virtualTour")} />
        </FieldGrid>
        <TextField label="Brochure path (optional)" placeholder="/brochures/…" error={errors.brochure?.message} {...register("brochure")} />
      </FormSection>

      <FormSection title="Master Plan">
        <MediaPickerField control={control} name="masterPlan" label="Master plan image" />
        <TagsField control={control} name="masterLegend" label="Master plan legend" />
      </FormSection>

      <FormSection
        title="Highlights"
        description="USP cards shown near the top of the project page."
      >
        {highlights.fields.map((f, i) => (
          <ArrayItem
            key={f.id}
            index={i}
            title={watch(`highlights.${i}.title`)}
            onRemove={() => highlights.remove(i)}
            onMove={highlights.move}
            isFirst={i === 0}
            isLast={i === highlights.fields.length - 1}
          >
            <TextField
              label="Title"
              placeholder="Yacht-shaped clubhouse"
              error={errors.highlights?.[i]?.title?.message}
              {...register(`highlights.${i}.title`)}
            />
            <TextareaField
              label="Description"
              rows={2}
              error={errors.highlights?.[i]?.description?.message}
              {...register(`highlights.${i}.description`)}
            />
            <TextField
              label="Icon key (optional)"
              placeholder="pool"
              error={errors.highlights?.[i]?.icon?.message}
              {...register(`highlights.${i}.icon`)}
            />
          </ArrayItem>
        ))}
        <AddItemButton
          label="Add highlight"
          onClick={() => highlights.append({ title: "", description: "", icon: "" })}
        />
      </FormSection>

      <FormSection title="Amenities" description="Amenity names shown on the property page.">
        <TagsField control={control} name="amenities" label="Amenities" />
      </FormSection>

      <FormSection title="Overview Stats" description="Label/value pairs in the overview grid.">
        {stats.fields.map((f, i) => (
          <ArrayItem
            key={f.id}
            index={i}
            title={watch(`overviewStats.${i}.label`)}
            onRemove={() => stats.remove(i)}
            onMove={stats.move}
            isFirst={i === 0}
            isLast={i === stats.fields.length - 1}
          >
            <FieldGrid>
              <TextField label="Label" error={errors.overviewStats?.[i]?.label?.message} {...register(`overviewStats.${i}.label`)} />
              <TextField label="Value" error={errors.overviewStats?.[i]?.value?.message} {...register(`overviewStats.${i}.value`)} />
            </FieldGrid>
          </ArrayItem>
        ))}
        <AddItemButton label="Add stat" onClick={() => stats.append({ label: "", value: "" })} />
      </FormSection>

      <FormSection title="Floor Plans">
        {floorPlans.fields.map((f, i) => (
          <ArrayItem
            key={f.id}
            index={i}
            title={watch(`floorPlans.${i}.type`)}
            onRemove={() => floorPlans.remove(i)}
            onMove={floorPlans.move}
            isFirst={i === 0}
            isLast={i === floorPlans.fields.length - 1}
          >
            <FieldGrid>
              <TextField label="Type" placeholder="4 BHK Sky Residence" error={errors.floorPlans?.[i]?.type?.message} {...register(`floorPlans.${i}.type`)} />
              <TextField label="Area" placeholder="4,200 sq.ft." error={errors.floorPlans?.[i]?.area?.message} {...register(`floorPlans.${i}.area`)} />
            </FieldGrid>
            <MediaPickerField control={control} name={`floorPlans.${i}.image`} label="Floor plan image" />
            <TextField label="Price (optional)" error={errors.floorPlans?.[i]?.price?.message} {...register(`floorPlans.${i}.price`)} />
            <TagsField control={control} name={`floorPlans.${i}.details`} label="Highlights" />
          </ArrayItem>
        ))}
        <AddItemButton
          label="Add floor plan"
          onClick={() => floorPlans.append({ id: "", type: "", area: "", image: "", price: "", details: [] })}
        />
      </FormSection>

      <FormSection title="Specifications">
        {specifications.fields.map((f, i) => (
          <ArrayItem
            key={f.id}
            index={i}
            title={watch(`specifications.${i}.category`)}
            onRemove={() => specifications.remove(i)}
            onMove={specifications.move}
            isFirst={i === 0}
            isLast={i === specifications.fields.length - 1}
          >
            <TextField label="Category" placeholder="Flooring" error={errors.specifications?.[i]?.category?.message} {...register(`specifications.${i}.category`)} />
            <TagsField control={control} name={`specifications.${i}.items`} label="Items" />
          </ArrayItem>
        ))}
        <AddItemButton label="Add specification" onClick={() => specifications.append({ category: "", items: [] })} />
      </FormSection>

      <FormSection title="Payment Plans">
        {paymentPlans.fields.map((f, i) => (
          <ArrayItem
            key={f.id}
            index={i}
            title={watch(`paymentPlans.${i}.label`)}
            onRemove={() => paymentPlans.remove(i)}
            onMove={paymentPlans.move}
            isFirst={i === 0}
            isLast={i === paymentPlans.fields.length - 1}
          >
            <TextField label="Label" error={errors.paymentPlans?.[i]?.label?.message} {...register(`paymentPlans.${i}.label`)} />
            <TextareaField label="Description" rows={2} error={errors.paymentPlans?.[i]?.description?.message} {...register(`paymentPlans.${i}.description`)} />
            <TextField label="Milestone (optional)" placeholder="10% on booking" error={errors.paymentPlans?.[i]?.milestone?.message} {...register(`paymentPlans.${i}.milestone`)} />
          </ArrayItem>
        ))}
        <AddItemButton label="Add payment plan" onClick={() => paymentPlans.append({ id: "", label: "", description: "", milestone: "" })} />
      </FormSection>

      <FormSection title="Nearby Landmarks">
        {landmarks.fields.map((f, i) => (
          <ArrayItem
            key={f.id}
            index={i}
            title={watch(`nearbyLandmarks.${i}.place`)}
            onRemove={() => landmarks.remove(i)}
            onMove={landmarks.move}
            isFirst={i === 0}
            isLast={i === landmarks.fields.length - 1}
          >
            <FieldGrid>
              <TextField label="Place" error={errors.nearbyLandmarks?.[i]?.place?.message} {...register(`nearbyLandmarks.${i}.place`)} />
              <TextField label="Distance" placeholder="2.4 km" error={errors.nearbyLandmarks?.[i]?.distance?.message} {...register(`nearbyLandmarks.${i}.distance`)} />
            </FieldGrid>
            <TextField label="Category (optional)" placeholder="Healthcare" error={errors.nearbyLandmarks?.[i]?.category?.message} {...register(`nearbyLandmarks.${i}.category`)} />
          </ArrayItem>
        ))}
        <AddItemButton label="Add landmark" onClick={() => landmarks.append({ place: "", distance: "", category: "" })} />
      </FormSection>

      <FormSection title="SEO">
        <TextField label="Meta title" error={errors.seo?.metaTitle?.message} {...register("seo.metaTitle")} />
        <TextareaField label="Meta description" rows={2} error={errors.seo?.metaDescription?.message} {...register("seo.metaDescription")} />
        <TagsField control={control} name="seo.keywords" label="Keywords" />
        <TextField label="OG image URL (optional)" error={errors.seo?.ogImage?.message} {...register("seo.ogImage")} />
      </FormSection>
    </>
  );
}

/* ----------------------------- mapping helpers ------------------------------ */

const emptyProperty = (): PropertyInput =>
  ({
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    location: "",
    city: "Hyderabad",
    state: "Telangana",
    price: 0,
    priceLabel: "",
    propertyType: "APARTMENTS",
    status: "NEW_LAUNCH",
    bedrooms: "",
    bathrooms: 0,
    area: "",
    possession: "",
    reraNumber: "",
    developer: "RENISINFRA",
    developerLogo: "",
    featuredImage: "",
    heroImages: [],
    video: "",
    virtualTour: "",
    brochure: "",
    masterPlan: "",
    masterLegend: [],
    certifications: [],
    featured: false,
    order: 0,
    gallery: [],
    amenities: [],
    floorPlans: [],
    specifications: [],
    paymentPlans: [],
    nearbyLandmarks: [],
    overviewStats: [],
    highlights: [],
    lat: undefined,
    lng: undefined,
    seo: { metaTitle: "", metaDescription: "", keywords: [], ogImage: "" },
  }) as PropertyInput;

const toFormValues = (p: AdminProperty): PropertyInput =>
  ({
    title: p.title,
    slug: p.slug,
    subtitle: p.subtitle,
    description: p.description,
    location: p.location,
    city: p.city,
    state: p.state,
    price: p.price,
    priceLabel: p.priceLabel,
    propertyType: p.propertyType,
    status: p.status,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    possession: p.possession,
    reraNumber: p.reraNumber,
    developer: p.developer,
    developerLogo: p.developerLogo ?? "",
    featuredImage: p.featuredImage,
    heroImages: p.heroImages ?? [],
    video: p.video ?? "",
    virtualTour: p.virtualTour ?? "",
    brochure: p.brochure ?? "",
    masterPlan: p.masterPlan,
    masterLegend: p.masterLegend,
    certifications: p.certifications ?? [],
    featured: p.featured ?? false,
    order: p.order ?? 0,
    gallery: p.gallery,
    amenities: p.amenities,
    floorPlans: p.floorPlans.map((f) => ({ ...f, id: f.id ?? "", price: f.price ?? "" })),
    specifications: p.specifications,
    paymentPlans: p.paymentPlans.map((pl) => ({ ...pl, id: pl.id ?? "", milestone: pl.milestone ?? "" })),
    nearbyLandmarks: p.nearbyLandmarks.map((n) => ({ ...n, category: n.category ?? "" })),
    overviewStats: p.overviewStats,
    highlights: (p.highlights ?? []).map((h) => ({ ...h, icon: h.icon ?? "" })),
    lat: p.lat,
    lng: p.lng,
    seo: { ...p.seo, ogImage: p.seo.ogImage ?? "" },
  }) as PropertyInput;

/** Builds the create payload for "Duplicate" (unique slug, draft-ish status). */
const duplicatePayload = (p: AdminProperty): PropertyInput => ({
  ...withIds(toFormValues(p)),
  title: `${p.title} (Copy)`,
  slug: `${p.slug}-copy-${Date.now().toString(36)}`,
  status: "COMING_SOON",
});

/** Backend requires ids on floor/payment plans — generate for new rows. */
const withIds = (values: PropertyInput): PropertyInput => ({
  ...values,
  floorPlans: values.floorPlans.map((f, i) => ({ ...f, id: f.id || `fp-${Date.now().toString(36)}-${i}` })),
  paymentPlans: values.paymentPlans.map((p, i) => ({ ...p, id: p.id || `pp-${Date.now().toString(36)}-${i}` })),
});

/* ---------------------------------- page ------------------------------------ */

export default function PropertiesPage() {
  const { create, update } = useCrudMutations("properties", adminApi.properties, "Property");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [preview, setPreview] = useState<AdminProperty | null>(null);

  const duplicate = (p: AdminProperty) => create.mutate(duplicatePayload(p));

  return (
    <>
      <ResourceCrud<AdminProperty, PropertyInput>
        resource="properties"
        singular="Property"
        api={adminApi.properties}
        schema={propertySchema}
        wide
        searchText={(p) => `${p.title} ${p.location} ${p.city}`}
        searchPlaceholder="Search properties…"
        filter={
          statusFilter || typeFilter
            ? (p) => (!statusFilter || p.status === statusFilter) && (!typeFilter || p.propertyType === typeFilter)
            : undefined
        }
        toolbar={
          <>
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              allLabel="All statuses"
              options={PROPERTY_STATUSES.map((s) => ({ value: s, label: label(s) }))}
            />
            <FilterSelect
              value={typeFilter}
              onChange={setTypeFilter}
              allLabel="All types"
              options={PROPERTY_TYPES.map((t) => ({ value: t, label: label(t) }))}
            />
          </>
        }
        columns={[
          {
            key: "title",
            header: "Property",
            render: (p) => (
              <div className="flex items-center gap-3">
                <div className="h-11 w-16 flex-none overflow-hidden bg-cream">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.featuredImage} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{p.title}</p>
                  <p className="truncate text-xs text-muted">/{p.slug}</p>
                </div>
              </div>
            ),
          },
          { key: "location", header: "Location", render: (p) => <span className="text-muted">{p.location.split(",")[0]}</span> },
          { key: "type", header: "Type", className: "w-32", render: (p) => <Badge tone="neutral">{label(p.propertyType)}</Badge> },
          {
            key: "status",
            header: "Status",
            className: "w-40",
            render: (p) => (
              <select
                value={p.status}
                onChange={(e) => update.mutate({ id: p.id, data: { status: e.target.value as PropertyStatusValue } })}
                onClick={(e) => e.stopPropagation()}
                className="cursor-pointer border border-line bg-white px-2 py-1.5 text-[0.62rem] uppercase tracking-[0.1em] outline-none transition-colors focus:border-gold"
              >
                {PROPERTY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            ),
          },
          { key: "price", header: "Price", className: "w-32", render: (p) => <span className="text-ink">{p.priceLabel}</span> },
        ]}
        extraActions={(p) => (
          <>
            <IconButton title="Preview property" onClick={() => setPreview(p)}>
              <Eye size={14} />
            </IconButton>
            <IconButton title="Duplicate property" onClick={() => duplicate(p)}>
              <Copy size={14} />
            </IconButton>
          </>
        )}
        defaults={emptyProperty}
        toFormValues={toFormValues}
        transform={withIds}
        Fields={Fields}
        pageSize={8}
      />

      {/* Preview */}
      <Modal open={preview !== null} onClose={() => setPreview(null)} title="Property Preview" size="lg">
        {preview && (
          <div>
            <div className="relative aspect-[16/7] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.featuredImage} alt={preview.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-white">
                <p className="text-[0.62rem] uppercase tracking-[0.24em] text-gold-soft">{preview.subtitle}</p>
                <h3 className="mt-1 font-display text-3xl font-light">{preview.title}</h3>
                <p className="mt-0.5 text-sm text-white/80">{preview.location}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Badge tone={STATUS_TONE[preview.status]}>{label(preview.status)}</Badge>
              <Badge tone="neutral">{label(preview.propertyType)}</Badge>
              <span className="font-display text-xl font-light">{preview.priceLabel}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">{preview.description}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-3">
              {preview.overviewStats.slice(0, 6).map((s) => (
                <div key={s.label}>
                  <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted">{s.label}</p>
                  <p className="mt-0.5 text-sm text-ink">{s.value}</p>
                </div>
              ))}
            </div>
            {/* Every project now resolves through the dynamic detail route. */}
            <a
              href={`/projects/${preview.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.18em] text-gold hover:underline"
            >
              Open public page <ExternalLink size={12} />
            </a>
          </div>
        )}
      </Modal>
    </>
  );
}
