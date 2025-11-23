"use client";
import React, { useCallback, useRef, useState } from "react";
import { Button, Card, CardBody, CardHeader, CardFooter, Progress } from "@heroui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  }, []);

  const onBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  

  const onAnalyze = async () => {
    setError("");
    setResult("");
    if (!file) {
      setError("Por favor, selecciona una imagen médica.");
      return;
    }
    try {
      setLoading(true);
      setProgress(10);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      setProgress(60);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.detail || `Error ${res.status}`);
      }
      const data = await res.json();
      setResult(data.content || "");
      setProgress(100);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-indigo-50 dark:from-black dark:via-zinc-900 dark:to-indigo-950 text-black dark:text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold">MD Consultoría</h1>
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent pb-2">Agente de diagnóstico por imágenes médicas</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">Sube una imagen médica para su análisis profesional.</p>
          </div>
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="mb-6 shadow-lg md:mb-0">
          <CardHeader className="pb-1 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 flex items-center justify-center text-white text-4xl">🩺</div>
              {/* <div>
                <p className="text-small text-zinc-600 dark:text-zinc-400">Carga de imagen</p>
                <h4 className="text-medium font-medium">Arrastra y suelta o selecciona desde tu dispositivo</h4>
              </div> */}
            </div>
            <Button variant="ghost" color="primary" onPress={() => { setFile(null); setPreview(null); setResult(""); setError(""); }}>Limpiar</Button>
          </CardHeader>
          <CardBody>
            <div
              onDragEnter={() => setDragActive(true)}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={`relative rounded-3xl border border-zinc-200/60 bg-white dark:bg-black/0 p-10 text-center cursor-pointer shadow-sm`}
              onClick={onBrowse}
            >
              <div className="relative">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-zinc-200/70"></div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-zinc-200/60"></div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-zinc-200/40"></div>
                <Button
                  color="primary"
                  className="relative z-20 rounded-full shadow-lg h-16 w-16 mx-auto flex items-center justify-center"
                  onPress={onBrowse}
                >
                  ↑
                </Button>
              </div>
              <div className="mt-8 text-center">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Paso 1</div>
                <div className="text-xl font-semibold">Comenzar</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Sube tu imagen y obtén un análisis rápido. También puedes arrastrarla aquí.</div>
              </div>
              
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                  setPreview(f ? URL.createObjectURL(f) : null);
                }}
              />
              {file && (
                <div className="mt-6 text-left">
                  <p className="text-sm font-medium flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />{file.name}</p>
                  <Progress aria-label="progreso" value={progress} className="mt-2" color="primary" />
                  {preview && (
                    <img
                      src={preview}
                      alt="previsualización"
                      className="mt-4 max-h-80 mx-auto rounded-xl border border-zinc-200 dark:border-zinc-700"
                    />
                  )}
                </div>
              )}
            </div>
          </CardBody>
          <CardFooter className="pt-2">
            <div className="w-full flex items-center justify-between gap-3">
              <Button
                color="primary"
                variant="solid"
                isLoading={loading}
                onPress={onAnalyze}
                isDisabled={!file}
              >
                Analizar imagen
              </Button>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </CardFooter>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="pb-1">
            <div>
              <p className="text-small text-zinc-600 dark:text-zinc-400">Resultados</p>
              <h4 className="text-medium font-medium">Análisis generado</h4>
            </div>
          </CardHeader>
          <CardBody>
            {result ? (
              <div className="prose dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-zinc-500 dark:text-zinc-400 text-sm">Sin contenido aún. Sube una imagen y pulsa Analizar.</div>
            )}
          </CardBody>
        </Card>
        </div>

        <Card className="mt-6 bg-white/70 dark:bg-black/40">
          <CardBody>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">Este agente es para fines educativos e informativos. Las conclusiones deben ser revisadas por profesionales de la salud.</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
