import type { Fr009Action, Fr009Errors, Fr009Lookup, Fr009Payload, Fr009Record } from "@/services/smki/tindakanPerbaikan.types";

export interface Fr009FormAction extends Fr009Action { clientKey: string }
export interface Fr009FormState extends Omit<Fr009Payload, "items"> { items: Fr009FormAction[] }
export interface Fr009SectionProps {
  form: Fr009FormState;
  lookup: Fr009Lookup;
  errors: Fr009Errors;
  onChange: (changes: Partial<Fr009FormState>) => void;
  disabled?: boolean;
}
export interface Fr009FormIdentity { id?: number; version?: number; status?: Fr009Record["status"] }
