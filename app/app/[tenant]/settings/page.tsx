import { redirect } from "next/navigation";

export default function SettingsIndex({ params }: { params: { tenant: string } }) {
  redirect(`/app/${params.tenant}/settings/team`);
}
