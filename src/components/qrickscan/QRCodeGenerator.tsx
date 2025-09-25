"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Image as ImageIcon, Loader2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";

const qrCodeSchema = z.object({
  text: z.string().min(1, { message: "Text or URL is required." }).max(500, { message: "Text or URL is too long." }),
  fgColor: z.string(),
  bgColor: z.string(),
  logo: z.any().optional(),
});

type QRCodeProps = {
  value: string;
  fgColor: string;
  bgColor: string;
  logoImage?: string;
  logoWidth?: number;
  logoHeight?: number;
};

export default function QRCodeGenerator() {
  const [qrProps, setQrProps] = useState<QRCodeProps | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof qrCodeSchema>>({
    resolver: zodResolver(qrCodeSchema),
    defaultValues: {
      text: "",
      fgColor: "#32CD32",
      bgColor: "#1E1E1E",
      logo: null,
    },
  });

  const { watch } = form;
  const fgColor = watch("fgColor");
  const bgColor = watch("bgColor");

  const onSubmit = (data: z.infer<typeof qrCodeSchema>) => {
    const processSubmit = (logoData?: {logoImage: string, logoWidth: number, logoHeight: number}) => {
       setQrProps({
        value: data.text,
        fgColor: data.fgColor,
        bgColor: data.bgColor,
        ...logoData,
      });
    }

    if (data.logo) {
      const logoUrl = URL.createObjectURL(data.logo);
      const img = new window.Image();
      img.src = logoUrl;
      img.onload = () => {
        const qrSize = 256; 
        const maxLogoSize = qrSize * 0.3;
        const aspectRatio = img.width / img.height;
        let logoWidth, logoHeight;
        if (img.width > img.height) {
          logoWidth = maxLogoSize;
          logoHeight = maxLogoSize / aspectRatio;
        } else {
          logoHeight = maxLogoSize;
          logoWidth = maxLogoSize * aspectRatio;
        }
        processSubmit({ logoImage: logoUrl, logoWidth, logoHeight });
      };
      img.onerror = () => {
        toast({
          title: "Image Error",
          description: "Could not load the logo image. Please try a different file.",
          variant: "destructive",
        });
        processSubmit();
      }
    } else {
      processSubmit();
    }
  };

  const handleDownload = () => {
    if (!qrCodeRef.current || !qrProps) {
        toast({
            title: "Error",
            description: "Could not download QR code. Please generate one first.",
            variant: "destructive"
        })
      return;
    }
    const canvas = qrCodeRef.current.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "qr.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Customize Your Code</CardTitle>
              <CardDescription>
                Enter your details to generate a custom QR code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text or URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://qrcode.gomes.lol" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-8">
                <FormField
                  control={form.control}
                  name="fgColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code Color</FormLabel>
                      <FormControl>
                        <div className="relative w-12 h-12">
                            <Label htmlFor="fgColor" className="block w-full h-full rounded-md border-2 cursor-pointer" style={{ backgroundColor: fgColor }} />
                            <Input id="fgColor" type="color" className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" {...field} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bgColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background</FormLabel>
                      <FormControl>
                        <div className="relative w-12 h-12">
                            <Label htmlFor="bgColor" className="block w-full h-full rounded-md border-2 cursor-pointer" style={{ backgroundColor: bgColor }}/>
                            <Input id="bgColor" type="color" className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" {...field} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="logo"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Center Image (optional)</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-4">
                            <label htmlFor="logo-upload" className="flex-grow cursor-pointer">
                                <div className="flex items-center gap-2 border border-dashed rounded-md p-3 text-muted-foreground hover:bg-muted/50 transition-colors">
                                    <ImageIcon className="h-5 w-5" />
                                    <span className="truncate">{value?.name || 'Upload an image'}</span>
                                </div>
                            </label>
                            <Input 
                                id="logo-upload"
                                type="file" 
                                className="hidden"
                                accept="image/png, image/jpeg, image/svg+xml"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    onChange(file);
                                    if(file) {
                                        setLogoPreview(URL.createObjectURL(file));
                                    } else {
                                        setLogoPreview(null);
                                        setQrProps(props => props ? {...props, logoImage: undefined} : null);
                                    }
                                }}
                                {...rest}
                            />
                            {logoPreview ? <Image src={logoPreview} alt="Logo Preview" width={48} height={48} className="rounded-md object-cover h-12 w-12"/> : <Skeleton className="h-12 w-12" />}
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate QR Code
              </Button>
            </CardFooter>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Your generated QR code will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6 aspect-square">
                <div ref={qrCodeRef} className="p-4 bg-white rounded-lg shadow-inner">
                {qrProps ? (
                    <QRCodeCanvas
                        value={qrProps.value}
                        size={256}
                        fgColor={qrProps.fgColor}
                        bgColor={qrProps.bgColor}
                        level="H"
                        imageSettings={qrProps.logoImage ? {
                            src: qrProps.logoImage,
                            height: qrProps.logoHeight!,
                            width: qrProps.logoWidth!,
                            excavate: true,
                        } : undefined}
                    />
                ) : (
                    <div className="w-[256px] h-[256px] flex flex-col items-center justify-center bg-gray-100 dark:bg-muted/20 rounded-lg">
                        <Wand2 className="h-16 w-16 text-muted-foreground/50" />
                        <p className="mt-4 text-sm text-muted-foreground text-center">Your QR code will be displayed here.</p>
                    </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="button" onClick={handleDownload} className="w-full" disabled={!qrProps || form.formState.isSubmitting}>
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
}
