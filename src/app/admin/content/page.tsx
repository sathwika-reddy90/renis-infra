"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm, type UseFormReturn } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import AdminTabs from "@/components/admin/Tabs";
import { useToast } from "@/components/admin/Toast";
import {
  TextField,
  TextareaField,
  TagsField,
  FieldGrid,
  FormSection,
  ArrayItem,
  AddItemButton,
} from "@/components/admin/form/fields";
import { MediaPickerField } from "@/components/admin/form/MediaPickerField";
import Skeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import { zodResolver } from "@/lib/admin/resolver";
import { contentApi } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/hooks";
import { siteContentSchema, type SiteContentInput } from "@/lib/admin/schemas";
import type { AdminSiteContent } from "@/lib/admin/types";

type Form = UseFormReturn<SiteContentInput>;

const TABS = [
  { value: "hero", label: "Hero" },
  { value: "launch", label: "Launch" },
  { value: "why", label: "Why Us" },
  { value: "invest", label: "Invest" },
  { value: "about", label: "About" },
  { value: "timeline", label: "Timeline" },
  { value: "offices", label: "Offices" },
  { value: "cta", label: "CTA Bands" },
  { value: "nav", label: "Navigation" },
] as const;

/** Maps a form field path to the tab that contains it, for error focusing. */
const TAB_FOR_FIELD: Record<string, string> = {
  landingHero: "hero",
  heroSlides: "hero",
  launch: "launch",
  whyUs: "why",
  invest: "invest",
  about: "about",
  timeline: "timeline",
  offices: "offices",
  ctaBands: "cta",
  nav: "nav",
};

const EMPTY: SiteContentInput = {
  landingHero: {
    image: "",
    eyebrow: "",
    headline: "",
    headlineHighlight: "",
    subheadline: "",
    cta: { label: "", href: "" },
  },
  heroSlides: [],
  launch: {
    eyebrow: "",
    name: "",
    location: "",
    description: "",
    image: "",
    discoverHref: "",
    registerHref: "",
  },
  whyUs: [],
  invest: [],
  about: { storyTitle: "", storyBody: [], visionMission: [], whyChoose: [], stats: [] },
  timeline: [],
  offices: [],
  ctaBands: [],
  nav: [],
};

const toFormValues = (c: AdminSiteContent): SiteContentInput => ({
  landingHero: {
    ...c.landingHero,
    eyebrow: c.landingHero.eyebrow ?? "",
    headlineHighlight: c.landingHero.headlineHighlight ?? "",
  },
  heroSlides: c.heroSlides ?? [],
  launch: c.launch,
  whyUs: (c.whyUs ?? []).map((s) => ({ ...s, icon: s.icon ?? "" })),
  invest: (c.invest ?? []).map((s) => ({ ...s, icon: s.icon ?? "" })),
  about: {
    storyTitle: c.about?.storyTitle ?? "",
    storyBody: c.about?.storyBody ?? [],
    visionMission: c.about?.visionMission ?? [],
    whyChoose: c.about?.whyChoose ?? [],
    stats: c.about?.stats ?? [],
  },
  timeline: c.timeline ?? [],
  offices: c.offices ?? [],
  ctaBands: (c.ctaBands ?? []).map((b) => ({
    ...b,
    description: b.description ?? "",
    image: b.image ?? "",
  })),
  nav: c.nav ?? [],
});

/* --------------------------------- panels ---------------------------------- */

function HeroPanel({ form }: { form: Form }) {
  const { register, control, watch, formState: { errors } } = form;
  const slides = useFieldArray({ control, name: "heroSlides" });

  return (
    <>
      <FormSection title="Landing Hero" description="The full-screen panel at the top of the homepage.">
        <MediaPickerField control={control} name="landingHero.image" label="Background image" />
        <TextField label="Eyebrow" placeholder="Hyderabad, India" {...register("landingHero.eyebrow")} />
        <FieldGrid>
          <TextField
            label="Headline"
            error={errors.landingHero?.headline?.message}
            {...register("landingHero.headline")}
          />
          <TextField
            label="Headline highlight"
            hint="Rendered in italic gold on the second line"
            {...register("landingHero.headlineHighlight")}
          />
        </FieldGrid>
        <TextareaField
          label="Subheadline"
          rows={2}
          error={errors.landingHero?.subheadline?.message}
          {...register("landingHero.subheadline")}
        />
        <FieldGrid>
          <TextField
            label="Button label"
            error={errors.landingHero?.cta?.label?.message}
            {...register("landingHero.cta.label")}
          />
          <TextField
            label="Button link"
            error={errors.landingHero?.cta?.href?.message}
            {...register("landingHero.cta.href")}
          />
        </FieldGrid>
      </FormSection>

      <FormSection
        title="Scroll Panels"
        description="Full-screen panels that slide over one another as the visitor scrolls."
      >
        {slides.fields.map((f, i) => (
          <ArrayItem
            key={f.id}
            index={i}
            title={watch(`heroSlides.${i}.title`)}
            onRemove={() => slides.remove(i)}
            onMove={slides.move}
            isFirst={i === 0}
            isLast={i === slides.fields.length - 1}
          >
            <MediaPickerField control={control} name={`heroSlides.${i}.image`} label="Image" />
            <FieldGrid>
              <TextField
                label="Category"
                placeholder="Entrance"
                error={errors.heroSlides?.[i]?.category?.message}
                {...register(`heroSlides.${i}.category`)}
              />
              <TextField
                label="Title"
                error={errors.heroSlides?.[i]?.title?.message}
                {...register(`heroSlides.${i}.title`)}
              />
            </FieldGrid>
            <TextField
              label="Location"
              error={errors.heroSlides?.[i]?.location?.message}
              {...register(`heroSlides.${i}.location`)}
            />
            <FieldGrid>
              <TextField label="Button label" {...register(`heroSlides.${i}.cta.label`)} />
              <TextField label="Button link" {...register(`heroSlides.${i}.cta.href`)} />
            </FieldGrid>
          </ArrayItem>
        ))}
        <AddItemButton
          label="Add scroll panel"
          onClick={() =>
            slides.append({
              category: "",
              image: "",
              title: "",
              location: "",
              cta: { label: "Discover Projects", href: "/projects" },
            })
          }
        />
      </FormSection>
    </>
  );
}

function LaunchPanel({ form }: { form: Form }) {
  const { register, control, formState: { errors } } = form;
  return (
    <FormSection title="Latest Launch" description="The highlighted launch band on the homepage.">
      <MediaPickerField control={control} name="launch.image" label="Image" />
      <FieldGrid>
        <TextField label="Eyebrow" error={errors.launch?.eyebrow?.message} {...register("launch.eyebrow")} />
        <TextField label="Name" error={errors.launch?.name?.message} {...register("launch.name")} />
      </FieldGrid>
      <TextField label="Location" error={errors.launch?.location?.message} {...register("launch.location")} />
      <TextareaField
        label="Description"
        rows={3}
        error={errors.launch?.description?.message}
        {...register("launch.description")}
      />
      <FieldGrid>
        <TextField label="Discover link" {...register("launch.discoverHref")} />
        <TextField label="Register link" {...register("launch.registerHref")} />
      </FieldGrid>
    </FormSection>
  );
}

/** Shared editor for the two icon/stat grids. */
function StatGridPanel({
  form,
  name,
  title,
  description,
}: {
  form: Form;
  name: "whyUs" | "invest";
  title: string;
  description: string;
}) {
  const { register, control, watch, formState: { errors } } = form;
  const items = useFieldArray({ control, name });

  return (
    <FormSection title={title} description={description}>
      {items.fields.map((f, i) => (
        <ArrayItem
          key={f.id}
          index={i}
          title={watch(`${name}.${i}.label`)}
          onRemove={() => items.remove(i)}
          onMove={items.move}
          isFirst={i === 0}
          isLast={i === items.fields.length - 1}
        >
          <FieldGrid>
            <TextField
              label="Stat"
              placeholder="18+"
              error={errors[name]?.[i]?.stat?.message}
              {...register(`${name}.${i}.stat`)}
            />
            <TextField
              label="Label"
              placeholder="Years of Craftsmanship"
              error={errors[name]?.[i]?.label?.message}
              {...register(`${name}.${i}.label`)}
            />
          </FieldGrid>
          <TextField label="Icon key" placeholder="years" {...register(`${name}.${i}.icon`)} />
        </ArrayItem>
      ))}
      <AddItemButton
        label="Add item"
        onClick={() => items.append({ icon: "", stat: "", label: "" })}
      />
    </FormSection>
  );
}

function AboutPanel({ form }: { form: Form }) {
  const { register, control, watch, formState: { errors } } = form;
  const visionMission = useFieldArray({ control, name: "about.visionMission" });
  const whyChoose = useFieldArray({ control, name: "about.whyChoose" });
  const stats = useFieldArray({ control, name: "about.stats" });

  return (
    <>
      <FormSection title="Story">
        <TextField
          label="Section title"
          error={errors.about?.storyTitle?.message}
          {...register("about.storyTitle")}
        />
        <TagsField
          control={control}
          name="about.storyBody"
          label="Paragraphs"
          hint="Each entry renders as its own paragraph"
        />
      </FormSection>

      <FormSection title="Vision & Mission">
        {visionMission.fields.map((f, i) => (
          <ArrayItem
            key={f.id}
            index={i}
            title={watch(`about.visionMission.${i}.kind`)}
            onRemove={() => visionMission.remove(i)}
            onMove={visionMission.move}
            isFirst={i === 0}
            isLast={i === visionMission.fields.length - 1}
          >
            <FieldGrid>
              <TextField label="Kind" placeholder="Vision" {...register(`about.visionMission.${i}.kind`)} />
              <TextField label="Title" {...register(`about.visionMission.${i}.title`)} />
            </FieldGrid>
            <TextareaField label="Text" rows={3} {...register(`about.visionMission.${i}.text`)} />
          </ArrayItem>
        ))}
        <AddItemButton
          label="Add entry"
          onClick={() => visionMission.append({ kind: "", title: "", text: "" })}
        />
      </FormSection>

      <FormSection title="Why Choose Us">
        {whyChoose.fields.map((f, i) => (
          <ArrayItem
            key={f.id}
            index={i}
            title={watch(`about.whyChoose.${i}.title`)}
            onRemove={() => whyChoose.remove(i)}
            onMove={whyChoose.move}
            isFirst={i === 0}
            isLast={i === whyChoose.fields.length - 1}
          >
            <TextField label="Title" {...register(`about.whyChoose.${i}.title`)} />
            <TextareaField label="Description" rows={2} {...register(`about.whyChoose.${i}.desc`)} />
          </ArrayItem>
        ))}
        <AddItemButton
          label="Add reason"
          onClick={() => whyChoose.append({ title: "", desc: "" })}
        />
      </FormSection>

      <FormSection title="Headline Stats">
        {stats.fields.map((f, i) => (
          <ArrayItem
            key={f.id}
            index={i}
            title={watch(`about.stats.${i}.label`)}
            onRemove={() => stats.remove(i)}
            onMove={stats.move}
            isFirst={i === 0}
            isLast={i === stats.fields.length - 1}
          >
            <FieldGrid>
              <TextField label="Stat" {...register(`about.stats.${i}.stat`)} />
              <TextField label="Label" {...register(`about.stats.${i}.label`)} />
            </FieldGrid>
          </ArrayItem>
        ))}
        <AddItemButton label="Add stat" onClick={() => stats.append({ stat: "", label: "" })} />
      </FormSection>
    </>
  );
}

function TimelinePanel({ form }: { form: Form }) {
  const { register, control, watch } = form;
  const items = useFieldArray({ control, name: "timeline" });
  return (
    <FormSection title="Company Timeline" description="Milestones shown on the About page.">
      {items.fields.map((f, i) => (
        <ArrayItem
          key={f.id}
          index={i}
          title={watch(`timeline.${i}.year`)}
          onRemove={() => items.remove(i)}
          onMove={items.move}
          isFirst={i === 0}
          isLast={i === items.fields.length - 1}
        >
          <FieldGrid>
            <TextField label="Year" placeholder="2007" {...register(`timeline.${i}.year`)} />
            <TextField label="Title" {...register(`timeline.${i}.title`)} />
          </FieldGrid>
          <TextareaField label="Text" rows={2} {...register(`timeline.${i}.text`)} />
        </ArrayItem>
      ))}
      <AddItemButton
        label="Add milestone"
        onClick={() => items.append({ year: "", title: "", text: "" })}
      />
    </FormSection>
  );
}

function OfficesPanel({ form }: { form: Form }) {
  const { register, control, watch, formState: { errors } } = form;
  const items = useFieldArray({ control, name: "offices" });
  return (
    <FormSection title="Offices" description="Shown on the Contact page and in the footer.">
      {items.fields.map((f, i) => (
        <ArrayItem
          key={f.id}
          index={i}
          title={watch(`offices.${i}.city`)}
          onRemove={() => items.remove(i)}
          onMove={items.move}
          isFirst={i === 0}
          isLast={i === items.fields.length - 1}
        >
          <TextField label="Name" placeholder="Head Office · Jubilee Hills" {...register(`offices.${i}.city`)} />
          <TextareaField label="Address" rows={2} {...register(`offices.${i}.address`)} />
          <FieldGrid>
            <TextField label="Phone" {...register(`offices.${i}.phone`)} />
            <TextField
              label="Email"
              type="email"
              error={errors.offices?.[i]?.email?.message}
              {...register(`offices.${i}.email`)}
            />
          </FieldGrid>
          <TextField label="Hours" placeholder="Mon – Sat · 10:00 AM – 7:00 PM" {...register(`offices.${i}.hours`)} />
        </ArrayItem>
      ))}
      <AddItemButton
        label="Add office"
        onClick={() => items.append({ city: "", address: "", phone: "", email: "", hours: "" })}
      />
    </FormSection>
  );
}

function CtaPanel({ form }: { form: Form }) {
  const { register, control, watch } = form;
  const items = useFieldArray({ control, name: "ctaBands" });
  return (
    <FormSection
      title="CTA Bands"
      description="Reusable call-to-action strips. The key decides which page uses it — changing a key will unlink it from its page."
    >
      {items.fields.map((f, i) => (
        <ArrayItem
          key={f.id}
          index={i}
          title={watch(`ctaBands.${i}.key`)}
          onRemove={() => items.remove(i)}
          onMove={items.move}
          isFirst={i === 0}
          isLast={i === items.fields.length - 1}
        >
          <TextField label="Key" placeholder="projects" {...register(`ctaBands.${i}.key`)} />
          <TextField label="Title" {...register(`ctaBands.${i}.title`)} />
          <TextareaField label="Description" rows={2} {...register(`ctaBands.${i}.description`)} />
          <MediaPickerField
            control={control}
            name={`ctaBands.${i}.image`}
            label="Background image (optional)"
          />
          <FieldGrid>
            <TextField label="Button label" {...register(`ctaBands.${i}.cta.label`)} />
            <TextField label="Button link" {...register(`ctaBands.${i}.cta.href`)} />
          </FieldGrid>
        </ArrayItem>
      ))}
      <AddItemButton
        label="Add CTA band"
        onClick={() =>
          items.append({ key: "", title: "", description: "", image: "", cta: { label: "", href: "" } })
        }
      />
    </FormSection>
  );
}

function NavPanel({ form }: { form: Form }) {
  const { register, control, watch } = form;
  const items = useFieldArray({ control, name: "nav" });
  return (
    <FormSection title="Main Navigation" description="Links in the site header and their order.">
      {items.fields.map((f, i) => (
        <ArrayItem
          key={f.id}
          index={i}
          title={watch(`nav.${i}.label`)}
          onRemove={() => items.remove(i)}
          onMove={items.move}
          isFirst={i === 0}
          isLast={i === items.fields.length - 1}
        >
          <FieldGrid>
            <TextField label="Label" {...register(`nav.${i}.label`)} />
            <TextField label="Link" placeholder="/projects" {...register(`nav.${i}.href`)} />
          </FieldGrid>
        </ArrayItem>
      ))}
      <AddItemButton label="Add link" onClick={() => items.append({ label: "", href: "" })} />
    </FormSection>
  );
}

/* ---------------------------------- page ----------------------------------- */

export default function ContentPage() {
  const qc = useQueryClient();
  const { push } = useToast();
  const [tab, setTab] = useState<string>("hero");

  const content = useQuery({
    queryKey: adminKeys.content,
    queryFn: ({ signal }) => contentApi.get(signal),
  });

  const form = useForm<SiteContentInput>({
    resolver: zodResolver<SiteContentInput>(siteContentSchema),
    defaultValues: EMPTY,
  });

  // Populate once content arrives (and after refetches).
  useEffect(() => {
    if (!content.data) return;
    form.reset(toFormValues(content.data));
  }, [content.data, form]);

  const save = useMutation({
    mutationFn: contentApi.update,
    onSuccess: () => {
      push("success", "Content saved");
      qc.invalidateQueries({ queryKey: adminKeys.content });
    },
    onError: (e) => push("error", e instanceof Error ? e.message : "Failed to save content"),
  });

  if (content.isPending) {
    return (
      <div className="max-w-3xl space-y-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (content.isError) {
    return (
      <ErrorState
        message="We couldn't load site content."
        onRetry={() => void content.refetch()}
      />
    );
  }

  return (
    <div className="max-w-3xl">
      <form
        onSubmit={form.handleSubmit(
          (values) => save.mutate(values),
          (errors) => {
            // Jump to the tab holding the first invalid field, otherwise the
            // error message is on a panel the editor can't see.
            const firstKey = Object.keys(errors)[0];
            const target = firstKey ? TAB_FOR_FIELD[firstKey] : undefined;
            if (target) setTab(target);
            push("error", "Please fix the highlighted fields");
          },
        )}
        noValidate
        className="border border-line bg-white"
      >
        <AdminTabs tabs={[...TABS]} value={tab} onChange={setTab} className="px-4" />

        <div role="tabpanel" className="space-y-6 p-6 md:p-8">
          {tab === "hero" && <HeroPanel form={form} />}
          {tab === "launch" && <LaunchPanel form={form} />}
          {tab === "why" && (
            <StatGridPanel
              form={form}
              name="whyUs"
              title="Why RENISINFRA"
              description="Icon/stat grid on the left of the homepage split section."
            />
          )}
          {tab === "invest" && (
            <StatGridPanel
              form={form}
              name="invest"
              title="Why Invest"
              description="Icon/stat grid on the right of the homepage split section."
            />
          )}
          {tab === "about" && <AboutPanel form={form} />}
          {tab === "timeline" && <TimelinePanel form={form} />}
          {tab === "offices" && <OfficesPanel form={form} />}
          {tab === "cta" && <CtaPanel form={form} />}
          {tab === "nav" && <NavPanel form={form} />}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-line bg-cream/40 px-6 py-4 md:px-8">
          <span className="flex items-start gap-2 text-xs leading-relaxed text-muted">
            <Info size={14} className="mt-0.5 flex-none text-gold" aria-hidden />
            Saving applies every tab, not just the one you are viewing.
          </span>
          <AdminButton type="submit" loading={save.isPending}>
            Save Content
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
