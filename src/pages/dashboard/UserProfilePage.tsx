import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import SectionCardHeader from "@/components/layout/SectionCardHeader";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  Input,
  Label,
} from "@/components/ui/primitives";
import ConfirmActionDialog from "@/components/ui/composites/confirm-action-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { notify } from "@/lib/notify";
import { getUserRoleLabel } from "@/lib/user-role-labels";

const MAX_PHOTO_MB = 3;
const TARGET_PHOTO_BYTES = 180 * 1024;

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Falha ao processar imagem."));
    };
    image.src = url;
  });

const canvasToDataUrl = (canvas: HTMLCanvasElement, quality: number): string =>
  canvas.toDataURL("image/jpeg", quality);

const compressImageToJpegBase64 = async (file: File): Promise<{ base64: string; mime: string; dataUrl: string }> => {
  const image = await loadImage(file);
  const maxDimension = 720;
  let width = image.width;
  let height = image.height;
  if (width > maxDimension || height > maxDimension) {
    const ratio = Math.min(maxDimension / width, maxDimension / height);
    width = Math.max(1, Math.round(width * ratio));
    height = Math.max(1, Math.round(height * ratio));
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Falha ao preparar compressão de imagem.");
  ctx.drawImage(image, 0, 0, width, height);

  let quality = 0.76;
  let dataUrl = canvasToDataUrl(canvas, quality);
  let payload = dataUrl.slice(dataUrl.indexOf(",") + 1);

  while (payload.length > TARGET_PHOTO_BYTES * 1.37 && quality > 0.45) {
    quality = Number((quality - 0.06).toFixed(2));
    dataUrl = canvasToDataUrl(canvas, quality);
    payload = dataUrl.slice(dataUrl.indexOf(",") + 1);
  }

  return {
    base64: payload,
    mime: "image/jpeg",
    dataUrl,
  };
};

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMime, setPhotoMime] = useState<string | null>(null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [removePhotoDialog, setRemovePhotoDialog] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setEmail(profile.email ?? "");
    setPhone(profile.phone ?? "");
    if (profile.profilePhotoBase64 && profile.profilePhotoMime) {
      setPhotoPreview(`data:${profile.profilePhotoMime};base64,${profile.profilePhotoBase64}`);
      setPhotoBase64(profile.profilePhotoBase64);
      setPhotoMime(profile.profilePhotoMime);
    } else {
      setPhotoPreview(null);
      setPhotoBase64(null);
      setPhotoMime(null);
    }
    setPhotoChanged(false);
  }, [profile]);

  const initials = useMemo(() => {
    const parts = String(profile?.name ?? "US").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "US";
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
  }, [profile?.name]);

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify.error("Arquivo inválido.", { description: "Selecione uma imagem (PNG, JPG ou WEBP)." });
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      notify.error("Imagem muito grande.", { description: `Use até ${MAX_PHOTO_MB}MB.` });
      return;
    }

    try {
      const compressed = await compressImageToJpegBase64(file);
      setPhotoPreview(compressed.dataUrl);
      setPhotoBase64(compressed.base64);
      setPhotoMime(compressed.mime);
      setPhotoChanged(true);
    } catch (error) {
      notify.error("Falha ao carregar imagem.", {
        description: error instanceof Error ? error.message : "Erro ao carregar imagem.",
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.auth.updateMe({
        email: email.trim(),
        phone: phone.trim() || null,
        profilePhotoBase64: photoChanged ? photoBase64 : undefined,
        profilePhotoMime: photoChanged ? photoMime : undefined,
      });
      await refreshProfile();
      notify.success("Perfil atualizado com sucesso.");
    } catch (error) {
      notify.error("Falha ao atualizar perfil.", {
        description: error instanceof Error ? error.message : "Erro ao atualizar perfil.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoBase64(null);
    setPhotoMime(null);
    setPhotoChanged(true);
    setRemovePhotoDialog(false);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Meu Perfil"
        description="Atualize sua foto, e-mail e telefone."
        actions={(
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Voltar
          </Button>
        )}
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card>
          <SectionCardHeader title="Foto de perfil" description="Esta imagem será exibida na barra superior." />
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-28 w-28 border border-border">
                <AvatarImage src={photoPreview ?? undefined} alt={profile?.name || "Usuário"} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <Input id="profile-photo-input" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById("profile-photo-input")?.click()}>
                Escolher foto
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setRemovePhotoDialog(true)}
              >
                Remover
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">A imagem é comprimida automaticamente para reduzir espaço.</p>
          </CardContent>
        </Card>

        <Card>
          <SectionCardHeader title="Dados da conta" description="Somente e-mail e telefone podem ser alterados." />
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Nome</Label>
              <Input value={profile?.name ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>CPF/CNPJ</Label>
              <Input value={profile?.cpf ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Papel</Label>
              <Input value={getUserRoleLabel(profile?.role ?? "USER")} disabled />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Cargo</Label>
              <Input value={profile?.cargo ?? "-"} disabled />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>E-mail</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Telefone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmActionDialog
        open={removePhotoDialog}
        onOpenChange={setRemovePhotoDialog}
        title="Remover foto"
        description="Tem certeza que deseja remover sua foto de perfil? Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmRemovePhoto}
      />
    </PageContainer>
  );
}
