import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/primitives";
import { Button } from "@/components/ui/primitives";
import { Input } from "@/components/ui/primitives";
import { Textarea } from "@/components/ui/primitives";
import { Label } from "@/components/ui/primitives";
import { Checkbox } from "@/components/ui/primitives";
import { Switch } from "@/components/ui/primitives";
import { RadioGroup, RadioGroupItem } from "@/components/ui/primitives";
import { Toggle } from "@/components/ui/primitives";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives";

export default function ComponentsShowcase() {
  const [togglePressed, setTogglePressed] = useState(false);
  const [checked, setChecked] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [radioValue, setRadioValue] = useState("option-1");
  const [selectValue, setSelectValue] = useState("baixa");
  const [tags, setTags] = useState(["React", "Chakra", "TypeScript"]);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    if (!tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      setTags((prev) => [...prev, value]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  return (
    <PageContainer>
      <PageHeader
        title="Showcase de Componentes 1"
        description="Controles base para ajustes de estilo do template."
      />

      <Card>
        <CardHeader>
          <CardTitle>Controles</CardTitle>
          <CardDescription>Botoes e seletores com estilos globais do template.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label>Botoes</Label>
            <div className="flex flex-wrap gap-3">
              <Button>Primario</Button>
              <Button variant="secondary">Secundario</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Toggle e Switch</Label>
            <div className="flex items-center gap-4">
              <Toggle pressed={togglePressed} onPressedChange={setTogglePressed} aria-label="Toggle exemplo">
                Toggle
              </Toggle>

              <div className="flex items-center gap-2">
                <Switch id="switch-exemplo" checked={enabled} onCheckedChange={setEnabled} />
                <Label htmlFor="switch-exemplo">Ativo</Label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Checkbox</Label>
            <div className="flex items-center gap-2">
              <Checkbox id="check-exemplo" checked={checked} onCheckedChange={(value) => setChecked(Boolean(value))} />
              <Label htmlFor="check-exemplo">Aceito os termos</Label>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Radio Group</Label>
            <RadioGroup value={radioValue} onValueChange={setRadioValue} className="space-y-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option-1" id="r1" />
                <Label htmlFor="r1">Opcao 1</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option-2" id="r2" />
                <Label htmlFor="r2">Opcao 2</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campos</CardTitle>
          <CardDescription>Inputs de texto e selecao.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="input-nome">Input</Label>
            <Input id="input-nome" placeholder="Digite um texto..." />
          </div>

          <div className="space-y-2">
            <Label>Select</Label>
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">Prioridade baixa</SelectItem>
                <SelectItem value="media">Prioridade media</SelectItem>
                <SelectItem value="alta">Prioridade alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="textarea-exemplo">Textarea</Label>
            <Textarea id="textarea-exemplo" placeholder="Escreva uma descricao..." />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tags-input">Tags</Label>
            <div className="rounded-md border bg-card px-2 py-1.5">
              <div className="flex min-h-10 flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-1 text-sm text-foreground"
                  >
                    {tag}
                    <button
                      type="button"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remover tag ${tag}`}
                    >
                      x
                    </button>
                  </span>
                ))}

                <input
                  id="tags-input"
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTag();
                    }
                  }}
                  onBlur={addTag}
                  placeholder="Add tag..."
                  className="h-8 min-w-36 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <p className="text-right text-sm text-muted-foreground">Press Enter or Return to add tag</p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

