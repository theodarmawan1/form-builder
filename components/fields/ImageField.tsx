"use client";

import { MdTextFields, MdImage } from "react-icons/md";
import { ElementsType, FormElementInstance, SubmitFunction } from "../FormElements";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { z } from "zod";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, ChangeEvent } from "react";
import useDesigner from "../hooks/useDesigner";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import axios from "axios";
import { da } from "date-fns/locale";
import { UploadButton } from "@/src/utils/uploadthing";
import { toast } from "../ui/use-toast";

// Schema untuk validasi properti banner
const propertiesSchema = z.object({
  bannerLabel: z.string().optional(),
  bannerImageUrl: z.string().optional()
});

// Default atribut untuk banner
const extraAttributes = {
  bannerLabel: "Your Banner",
  bannerImageUrl: "",
};

const type: ElementsType = "BannerField";

export const BannerFieldFormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: MdImage,
    label: "Banner Field",
  },
  designerComponent: BannerDesignerComponent,
  formComponent: BannerFormComponent,
  propertiesComponent: PropertiesComponent,

  // Tambahkan properti validate
  validate: (elementInstance: FormElementInstance) => {
    const element = elementInstance as CustomInstance;
    const { bannerImageUrl, bannerLabel } = element.extraAttributes;

    // Validasi dengan logika sederhana
    if (!bannerImageUrl || (bannerLabel && bannerLabel.length > 100)) {
      return false; // Tidak valid
    }
    return true; // Valid
  },
};


type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

// **DesignerComponent**: Menampilkan banner dalam desain form
function BannerDesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { bannerLabel, bannerImageUrl, fullWidth } = element.extraAttributes;

  // Debugging
  console.log("Rendering BannerDesignerComponent with:", { bannerLabel, bannerImageUrl, fullWidth });

  return (
    <div
      className={`flex flex-col gap-2 w-full ${
        fullWidth ? "w-full" : "max-w-[600px]"
      } p-4 rounded-lg`}
    >
      {bannerImageUrl ? (
        <img
        src={bannerImageUrl}
        alt="Banner"
        className="rounded-md"
        style={{
          width: "14%", // Ganti width sesuai kebutuhan
          height: "23%", // Ganti height sesuai kebutuhan
          objectFit: "cover",
        }}
      />
      ) : (
        <p className="text-muted-foreground">No banner image uploaded</p>
      )}
      {bannerLabel && <h2 className="text-lg font-semibold">{bannerLabel}</h2>}
    </div>
  );
}



// **FormComponent**: Menampilkan banner di dalam formulir
// **FormComponent**: Menampilkan banner di dalam formulir
function BannerFormComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { bannerImageUrl, bannerLabel } = element.extraAttributes;

  // Pastikan gambar tetap ada meskipun form berganti halaman/tombol
  useEffect(() => {
    // Jika gambar URL berubah, lakukan sesuatu jika perlu
    console.log("Banner image URL changed:", bannerImageUrl);
  }, [bannerImageUrl]);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {bannerImageUrl ? (
        <img
          src={bannerImageUrl}
          alt="Banner"
          className="rounded-md"
          style={{
            width: "44%", // Ganti width sesuai kebutuhan
            height: "100%", // Ganti height sesuai kebutuhan
            objectFit: "cover",
          }}
        />
      ) : (
        <p className="text-muted-foreground">No banner image uploaded</p>
      )}
      {bannerLabel && <h2 className="text-lg font-semibold">{bannerLabel}</h2>}
    </div>
  );
}

const saveBannerToDatabase = async (file: File, bannerLabel: string) => {
  console.log("Preparing to save banner:", { file, bannerLabel });

  if (!file) {
    console.error("File is required");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);  // Menambahkan file ke FormData
    formData.append("bannerLabel", bannerLabel);  // Menambahkan label banner jika diperlukan

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,  // Mengirim formData, bukan JSON
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to save banner:", error);
    } else {
      console.log("Banner saved successfully");
    }
  } catch (error) {
    console.error("Error saving banner:", error);
  }
};




// **PropertiesComponent**: Mengatur properti banner
// **PropertiesComponent**: Mengatur properti banner
type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { updateElement, setSelectedElement } = useDesigner(); // State global
  const form = useForm({
    resolver: zodResolver(propertiesSchema),
    mode: "onSubmit",
    defaultValues: {
      bannerLabel: element.extraAttributes.bannerLabel,
      fullWidth: element.extraAttributes.fullWidth,
    },
  });

  useEffect(() => {
    // Reset form dengan data terbaru dari state global
    form.reset(element.extraAttributes);
  }, [element, form]);

  // Variabel untuk menyimpan URL gambar sementara
  let uploadedBannerImageUrl = "";

  // Fungsi applyChanges untuk menangani perubahan
  function applyChanges(values: propertiesFormSchemaType) {
    const { bannerLabel } = values;

    // Jika URL gambar sudah diupload, set bannerImageUrl ke URL baru
    const finalBannerImageUrl = uploadedBannerImageUrl || element.extraAttributes.bannerImageUrl;

    updateElement(element.id, {
      ...element,
      extraAttributes: {
        bannerLabel,  // Hanya memperbarui bannerLabel
        bannerImageUrl: finalBannerImageUrl, // Gunakan URL gambar yang diupload atau yang lama
      },
    });

    toast({
      title: "Success",
      description: "Properties saved successfully",
    });

    setSelectedElement(null);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(applyChanges)} className="space-y-3">
        <FormField
          control={form.control}
          name="bannerLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              </FormControl>
              <FormDescription>
                The label of the field. <br /> It will be displayed above the field
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormLabel>Upload Banner</FormLabel>
          <FormDescription>Upload an image to display as the banner.</FormDescription>
          <br />
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              // Simpan URL gambar yang diupload ke dalam variabel sementara
              uploadedBannerImageUrl = res[0].url;
              alert("Upload Completed");
            }}
            onUploadError={(error: Error) => {
              // Menangani error upload
              alert(`ERROR! ${error.message}`);
            }}
          />
        </div>
        <Separator />
        <Button className="w-full" type="submit">
          Save
        </Button>
      </form>
    </Form>
  );
}
