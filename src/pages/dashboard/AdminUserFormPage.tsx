import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives";
import { api } from "@/services/api";
import { notify } from "@/lib/notify";
import { USER_ROLE_LABELS } from "@/lib/user-role-labels";

type UserRole = "USER" | "ADMIN" | "SUPER";

type FormValues = {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  role: UserRole;
  cargo: string;
  password: string;
  mustChangePassword: boolean;
};

const MAX_PHOTO_MB = 3;
const TARGET_PHOTO_BYTES = 180 * 1024;

const emptyForm: FormValues = {
  name: "",
  cpf: "",
  email: "",
  phone: "",
  role: "USER",
  cargo: "",
  password: "",
  mustChangePassword: true,
};

const formatDocument = (value: string): string => {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
};

const generatePin = (): string =>
  String(Math.floor(100000 + Math.random() * 900000));

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

export default function AdminUserFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormValues>(emptyForm);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMime, setPhotoMime] = useState<string | null>(null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);

  const userQuery = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => api.users.getById(String(id)),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (!userQuery.data || !isEdit) return;
    setForm({
      name: userQuery.data.name,
      cpf: userQuery.data.cpf,
      email: userQuery.data.email,
      phone: userQuery.data.phone ?? "",
      role: userQuery.data.role,
      cargo: userQuery.data.cargo ?? "",
      password: "",
      mustChangePassword: true,
    });
    if (!photoChanged) {
      if (userQuery.data.profilePhotoBase64 && userQuery.data.profilePhotoMime) {
        setPhotoBase64(userQuery.data.profilePhotoBase64);
        setPhotoMime(userQuery.data.profilePhotoMime);
        setPhotoPreview(`data:${userQuery.data.profilePhotoMime};base64,${userQuery.data.profilePhotoBase64}`);
      } else {
        setPhotoBase64(null);
        setPhotoMime(null);
        setPhotoPreview(null);
      }
    }
  }, [userQuery.data, isEdit, photoChanged]);

  const initials = useMemo(() => {
    const parts = form.name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "US";
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
  }, [form.name]);

  const createUser = useMutation({
    mutationFn: () =>
      api.users.create({
        name: form.name,
        cpf: form.cpf,
        email: form.email,
        phone: form.phone || null,
        role: form.role,
        cargo: form.cargo || null,
        password: form.password || undefined,
        mustChangePassword: form.mustChangePassword,
        profilePhotoBase64: photoBase64,
        profilePhotoMime: photoMime,
      }),
    onSuccess: async (result) => {
      if (result.generatedPin) {
        setGeneratedPin(result.generatedPin);
      } else {
        notify.success("Usuário criado com sucesso.");
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-memberships"] }),
      ]);
    },
    onError: (error) =>
      notify.error("Falha ao criar usuário.", {
        description: error instanceof Error ? error.message : "Erro ao criar usuário.",
      }),
  });

  const updateUser = useMutation({
    mutationFn: () =>
      api.users.update(String(id), {
        name: form.name || undefined,
        email: form.email || undefined,
        phone: form.phone || null,
        role: form.role,
        cargo: form.cargo || null,
        profilePhotoBase64: photoChanged ? photoBase64 : undefined,
        profilePhotoMime: photoChanged ? photoMime : undefined,
      }),
    onSuccess: async () => {
      notify.success("Usuário atualizado.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-user", id] }),
      ]);
      navigate("/dashboard/admin/usuarios");
    },
    onError: (error) =>
      notify.error("Falha ao atualizar usuário.", {
        description: error instanceof Error ? error.message : "Erro ao atualizar usuário.",
      }),
  });

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

  const canSubmit = Boolean(form.name.trim() && form.cpf.trim() && form.email.trim());
  const isSubmitting = createUser.isPending || updateUser.isPending;

  const handleSubmit = () => {
    if (!canSubmit) {
      notify.error("Preencha os campos obrigatórios.");
      return;
    }
    if (isEdit) {
      updateUser.mutate();
      return;
    }
    createUser.mutate();
  };

  return (
    <PageContainer>
      <PageHeader
        title={isEdit ? "Editar Usuário" : "Novo Usuário"}
        description={isEdit ? "Atualize os dados cadastrais do usuário." : "Preencha os dados para cadastrar um novo usuário."}
        actions={(
          <Button variant="outline" onClick={() => navigate("/dashboard/admin/usuarios")}>
            Voltar
          </Button>
        )}
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Foto de perfil</CardTitle>
            <CardDescription>Opcional. A foto é usada para identificação visual do usuário.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-28 w-28 border border-border">
                <AvatarImage src={photoPreview ?? undefined} alt={form.name || "Usuário"} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <Input id="user-photo-input" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById("user-photo-input")?.click()}>
                Escolher foto
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setPhotoPreview(null);
                  setPhotoBase64(null);
                  setPhotoMime(null);
                  setPhotoChanged(true);
                }}
              >
                Remover
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Formatos suportados: PNG, JPG e WEBP, até {MAX_PHOTO_MB}MB.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados do usuário</CardTitle>
            <CardDescription>Campos com * são obrigatórios.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Nome completo *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do usuário"
              />
            </div>

            <div className="space-y-2">
              <Label>CPF ou CNPJ *</Label>
              <Input
                value={form.cpf}
                onChange={(e) => setForm((prev) => ({ ...prev, cpf: formatDocument(e.target.value) }))}
                placeholder="000.000.000-00"
                inputMode="numeric"
                disabled={isEdit}
              />
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="(00) 00000-0000"
                inputMode="tel"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>E-mail *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Papel no sistema *</Label>
              <Select
                value={form.role}
                onValueChange={(value) => setForm((prev) => ({ ...prev, role: value as UserRole }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">{USER_ROLE_LABELS.USER}</SelectItem>
                  <SelectItem value="ADMIN">{USER_ROLE_LABELS.ADMIN}</SelectItem>
                  <SelectItem value="SUPER">{USER_ROLE_LABELS.SUPER}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input
                value={form.cargo}
                onChange={(e) => setForm((prev) => ({ ...prev, cargo: e.target.value }))}
                placeholder="Ex: Síndico, Zelador..."
              />
            </div>

            {!isEdit ? (
              <>
                <div className="space-y-2 md:col-span-2">
                  <Label>Senha inicial</Label>
                  <div className="flex gap-2">
                    <Input
                      value={form.password}
                      onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Deixe vazio para gerar PIN automático"
                      className="font-mono"
                    />
                    <Button type="button" variant="outline" onClick={() => setForm((prev) => ({ ...prev, password: generatePin() }))}>
                      Gerar PIN
                    </Button>
                  </div>
                </div>
                <label className="md:col-span-2 flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.mustChangePassword}
                    onChange={(e) => setForm((prev) => ({ ...prev, mustChangePassword: e.target.checked }))}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span className="text-sm">Exigir troca de senha no primeiro acesso</span>
                </label>
              </>
            ) : null}

            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => navigate("/dashboard/admin/usuarios")}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !canSubmit}>
                {isSubmitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar usuário"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {generatedPin ? (
        <div className="state-warning-soft fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border p-4 shadow-lg">
          <p className="text-sm font-semibold">PIN gerado para o novo usuário</p>
          <p className="mt-1 font-mono text-2xl font-bold">{generatedPin}</p>
          <p className="mt-1 text-xs">Anote este PIN. Ele não será exibido novamente.</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate("/dashboard/admin/usuarios")}>
            OK, voltar para lista
          </Button>
        </div>
      ) : null}
    </PageContainer>
  );
}
