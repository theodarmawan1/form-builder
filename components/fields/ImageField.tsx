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

// Schema untuk validasi properti banner
const propertiesSchema = z.object({
  bannerLabel: z.string().optional(),
  bannerImageUrl: z.string().optional(),
  fullWidth: z.boolean().default(false),
});

// Default atribut untuk banner
const extraAttributes = {
  bannerLabel: "Your Banner",
  bannerImageUrl: "",
  fullWidth: true,
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
      className={`flex flex-col items-center gap-2 w-full ${
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
            width: "24%", // Ganti width sesuai kebutuhan
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
function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
  const element = elementInstance as CustomInstance;
  const { updateElement } = useDesigner(); // State global
  const form = useForm({
    resolver: zodResolver(propertiesSchema),
    mode: "onBlur",
    defaultValues: {
      bannerLabel: element.extraAttributes.bannerLabel,
      bannerImageUrl: element.extraAttributes.bannerImageUrl,
      fullWidth: element.extraAttributes.fullWidth,
    },
  });

  useEffect(() => {
    // Reset form dengan data terbaru dari state global
    form.reset(element.extraAttributes);
  }, [element, form]);
  
  const [imageUrl, setImageUrl] = useState<string>('');

  const applyChanges = (values: z.infer<typeof propertiesSchema>) => {
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        ...element.extraAttributes,
        ...values, // Terapkan semua nilai form ke elemen
      },
    });

    // Debugging
    console.log("Element updated with new attributes:", values);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
  
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
  
        if (response.ok) {
          const data = await response.json();
          const imageUrl = data.imageUrl;
          updateElement(element.id, {
            ...element,
            extraAttributes: {
              ...element.extraAttributes,
              bannerImageUrl: imageUrl,
            },
          });
          console.log("Uploaded image URL:", data.imageUrl);
          // await saveBannerToDatabase(imageUrl, element.extraAttributes.bannerLabel || "Default Label");
        } else {
          const errorText = await response.text();
          console.error("Failed to upload image:", errorText);
        }
      } catch (error) {
        console.error("Unexpected error during upload:", error);
      }
    }
  };
  
  
  

  return (
    <Form {...form}>
      <form
        // onBlur={form.handleSubmit(applyChanges)}
        onSubmit={(e) => e.preventDefault()}
        className="space-y-3"
      >
        <FormField
          control={form.control}
          name="bannerLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner Label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Text displayed over the banner.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormLabel>Upload Banner</FormLabel>
          <FormDescription>Upload an image to display as the banner.</FormDescription>
          <Separator />
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              // Do something with the response
              alert("Upload Completed");
              updateElement(element.id, {
                ...element,
                extraAttributes: {
                  ...element.extraAttributes,
                  bannerImageUrl: res[0].url, // Memperbarui bannerImageUrl dengan URL yang baru
                },
              });
            }}
            onUploadError={(error: Error) => {
              // Do something with the error.
              alert(`ERROR! ${error.message}`);
            }}
          />
        </div>
        <FormField
          control={form.control}
          name="fullWidth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Width</FormLabel>
              <FormDescription>
                If enabled, the banner will stretch to the full width of the form.
              </FormDescription>
              <Separator />
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
