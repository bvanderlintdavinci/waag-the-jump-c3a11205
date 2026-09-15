import { Eye, EyeOff } from "lucide-react";

import {
  type ExtendedProfileKey,
  type ExtendedProfileValues,
  type ProfileVisibility,
} from "@/lib/profile-details";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  values: ExtendedProfileValues;
  visibility: ProfileVisibility;
  onValueChange: (key: ExtendedProfileKey, value: string) => void;
  onVisibilityChange: (key: ExtendedProfileKey, visible: boolean) => void;
};

const SELECTS: Array<{
  key: ExtendedProfileKey;
  label: string;
  placeholder: string;
  options: string[];
}> = [
  { key: "education_level", label: "Opleidingsniveau", placeholder: "Kies indien gewenst", options: ["Middelbare school", "Mbo", "Hbo", "Universiteit", "Anders"] },
  { key: "living_situation", label: "Woonsituatie", placeholder: "Kies indien gewenst", options: ["Alleenwonend", "Met kinderen", "Met huisgenoten", "Anders"] },
  { key: "relationship_status", label: "Relatiestatus", placeholder: "Kies indien gewenst", options: ["Single", "Gescheiden", "Weduwe / weduwnaar", "Open relatie", "Anders"] },
  { key: "has_children", label: "Kinderen", placeholder: "Kies indien gewenst", options: ["Geen kinderen", "Kinderen thuis", "Uitwonende kinderen", "Co-ouderschap", "Zeg ik liever niet"] },
  { key: "child_wish", label: "Kinderwens", placeholder: "Kies indien gewenst", options: ["Ja", "Nee", "Misschien", "Niet meer", "Zeg ik liever niet"] },
];

const TEXT_FIELDS: Array<{ key: ExtendedProfileKey; label: string; placeholder: string }> = [
  { key: "occupation", label: "Beroep", placeholder: "Bijvoorbeeld docent, verpleegkundige of ondernemer" },
  { key: "industry", label: "Werkgebied / branche", placeholder: "Bijvoorbeeld onderwijs, zorg of techniek" },
  { key: "languages", label: "Talen", placeholder: "Nederlands, Engels, Duits" },
  { key: "sports", label: "Sporten", placeholder: "Hardlopen, padel, wandelen" },
];

const TEXT_AREAS: Array<{ key: ExtendedProfileKey; label: string; placeholder: string }> = [
  { key: "children_details", label: "Meer over je gezin", placeholder: "Wat wil je hierover delen?" },
  { key: "lifestyle", label: "Levensstijl", placeholder: "Vertel bijvoorbeeld over uitgaan, rust, reizen of gezondheid" },
  { key: "favorite_activities", label: "Favoriete bezigheden", placeholder: "Waar maak je graag tijd voor?" },
  { key: "dating_preferences", label: "Wat zoek je in een kennismaking of date?", placeholder: "Vertel wat bij jou past en waar je voor openstaat" },
];

const FAMILY_TEXT_AREAS = [
  { key: "children_details", label: "Meer over je gezin", placeholder: "Wat wil je hierover delen?" },
  { key: "dating_preferences", label: "Wat zoek je in een kennismaking of date?", placeholder: "Vertel wat bij jou past en waar je voor openstaat" },
] satisfies Array<{ key: ExtendedProfileKey; label: string; placeholder: string }>;

function VisibilityControl({ field, visible, onChange }: { field: ExtendedProfileKey; visible: boolean; onChange: (visible: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      {visible ? <Eye className="size-4 text-primary" /> : <EyeOff className="size-4 text-muted-foreground" />}
      <Label htmlFor={`visibility-${field}`} className="text-xs font-normal text-muted-foreground">
        Zichtbaar voor leden
      </Label>
      <Switch id={`visibility-${field}`} checked={visible} onCheckedChange={onChange} />
    </div>
  );
}

function FieldFrame({ field, label, visibility, onVisibilityChange, children }: {
  field: ExtendedProfileKey;
  label: string;
  visibility: ProfileVisibility;
  onVisibilityChange: Props["onVisibilityChange"];
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={`dating-${field}`}>{label}</Label>
        <VisibilityControl field={field} visible={visibility[field]} onChange={(visible) => onVisibilityChange(field, visible)} />
      </div>
      {children}
    </div>
  );
}

export function DatingProfileFields({ values, visibility, onValueChange, onVisibilityChange }: Props) {
  return (
    <div className="grid gap-7">
      <div>
        <h3 className="text-lg text-foreground">Werk en achtergrond</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {SELECTS.slice(0, 2).map((field) => (
            <FieldFrame key={field.key} field={field.key} label={field.label} visibility={visibility} onVisibilityChange={onVisibilityChange}>
              <Select value={values[field.key]} onValueChange={(value) => onValueChange(field.key, value)}>
                <SelectTrigger id={`dating-${field.key}`}><SelectValue placeholder={field.placeholder} /></SelectTrigger>
                <SelectContent>{field.options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
              </Select>
            </FieldFrame>
          ))}
          {TEXT_FIELDS.slice(0, 3).map((field) => (
            <FieldFrame key={field.key} field={field.key} label={field.label} visibility={visibility} onVisibilityChange={onVisibilityChange}>
              <Input id={`dating-${field.key}`} maxLength={120} placeholder={field.placeholder} value={values[field.key]} onChange={(event) => onValueChange(field.key, event.target.value)} />
            </FieldFrame>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-lg text-foreground">Leven en vrije tijd</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {TEXT_FIELDS.slice(3).map((field) => (
            <FieldFrame key={field.key} field={field.key} label={field.label} visibility={visibility} onVisibilityChange={onVisibilityChange}>
              <Input id={`dating-${field.key}`} maxLength={200} placeholder={field.placeholder} value={values[field.key]} onChange={(event) => onValueChange(field.key, event.target.value)} />
            </FieldFrame>
          ))}
          {TEXT_AREAS.slice(1, 3).map((field) => (
            <FieldFrame key={field.key} field={field.key} label={field.label} visibility={visibility} onVisibilityChange={onVisibilityChange}>
              <Textarea id={`dating-${field.key}`} rows={3} maxLength={500} placeholder={field.placeholder} value={values[field.key]} onChange={(event) => onValueChange(field.key, event.target.value)} />
            </FieldFrame>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-lg text-foreground">Dating en gezin</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {SELECTS.slice(2).map((field) => (
            <FieldFrame key={field.key} field={field.key} label={field.label} visibility={visibility} onVisibilityChange={onVisibilityChange}>
              <Select value={values[field.key]} onValueChange={(value) => onValueChange(field.key, value)}>
                <SelectTrigger id={`dating-${field.key}`}><SelectValue placeholder={field.placeholder} /></SelectTrigger>
                <SelectContent>{field.options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
              </Select>
            </FieldFrame>
          ))}
          {FAMILY_TEXT_AREAS.map((field) => (
            <FieldFrame key={field.key} field={field.key} label={field.label} visibility={visibility} onVisibilityChange={onVisibilityChange}>
              <Textarea id={`dating-${field.key}`} rows={3} maxLength={500} placeholder={field.placeholder} value={values[field.key]} onChange={(event) => onValueChange(field.key, event.target.value)} />
            </FieldFrame>
          ))}
        </div>
      </div>
    </div>
  );
}