import React from "react";
import { useNavigate } from "react-router-dom";
import { getOwnProfile, updateOwnProfile } from "../api/profile";
import {
  ProfileForm,
  buildFormValues,
  type ProfileFormValues,
} from "../components/profile/ProfileForm";

function toPayload(values: ProfileFormValues) {
  return {
    role: values.role,
    claimedGrade: values.claimedGrade,
    primaryStack: values.primaryStackText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    experienceYears: values.experienceYears,
    hackathonsCount: values.hackathonsCount,
    bio: values.bio.trim(),
    projectLinks: values.projectLinks
      .map((item) => ({
        url: item.url.trim(),
        title: item.title.trim(),
        description: item.description.trim(),
      }))
      .filter((item) => item.url && item.title && item.description),
    telegramUsername: values.telegramUsername.trim() || null,
    githubUrl: values.githubUrl.trim() || null,
    isPublic: values.isPublic,
  };
}

export function ProfileEditPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [values, setValues] = React.useState<ProfileFormValues | null>(null);

  React.useEffect(() => {
    getOwnProfile()
      .then((data) => setValues(buildFormValues(data.profile)))
      .catch(() => setError("Не удалось загрузить данные профиля."))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async () => {
    if (!values) return;
    setSaving(true);
    setError(null);
    try {
      await updateOwnProfile(toPayload(values));
      navigate("/profile");
    } catch (err) {
      const typed = err as Error;
      setError(typed.message || "Не удалось сохранить профиль.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-slate-300">Загружаем форму профиля...</p>;
  }

  if (!values) {
    return <p className="text-red-300">{error ?? "Форма недоступна."}</p>;
  }

  return (
    <div>
      {error ? <p className="mb-4 text-red-300">{error}</p> : null}
      <ProfileForm values={values} onChange={setValues} onSubmit={onSubmit} loading={saving} />
    </div>
  );
}
