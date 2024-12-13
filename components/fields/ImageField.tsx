"use client";

import { MdTextFields } from "react-icons/md";
import { ElementsType, FormElement, FormElementInstance, SubmitFunction } from "../FormElements";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { z } from "zod";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, ChangeEvent } from "react";
import useDesigner from "../hooks/useDesigner";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";

import { MdImage } from "react-icons/md"; // Import ikon gambar

// Schema untuk validasi properti elemen
const propertiesSchema = z.object({
  label: z.string().nonempty("Label is required"),
  helperText: z.string().optional(),
  required: z.boolean().optional(),
});

const type: ElementsType = "ImageField";

const extraAttributes = {
  label: "Upload Image",
  helperText: "Upload an image file",
  required: false,
};

export const ImageFieldFormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: MdImage,
    label: "Image Field",
  },
  designerComponent: ImageDesignerComponent,
  formComponent: ImageFormComponent,
  propertiesComponent: PropertiesComponent,

  validate: (formElement: FormElementInstance, currentValue: string ): boolean => {
    const element = formElement as CustomInstance;
    if (element.extraAttributes.required) {
      return currentValue.length > 0 && currentValue.trim() !== "";
    }
    return true;
  },
};

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

function ImageDesignerComponent({ elementInstance }: { elementInstance: any }) {
  const element = elementInstance;
  const { label, required, helperText } = element.extraAttributes;

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label>
        {label}
        {required && "*"}
      </Label>
      <input type="file" disabled className="cursor-not-allowed" />
      {helperText && <p className="text-muted-foreground text-[0.8rem]">{helperText}</p>}
    </div>
  );
}

function ImageFormComponent({
  elementInstance,
  submitValue,
  isInvalid,
  defaultValue,
  }: {
  elementInstance: FormElementInstance;
  submitValue?: SubmitFunction;
  isInvalid?: boolean;
  defaultValue?: string;
  }) {
  const element = elementInstance as CustomInstance;

  const [value, setValue] = useState<string | null>(null);


  const [error, setError] = useState(false);

  useEffect(() => {
      setError(isInvalid === true);
  }, [isInvalid]);

  const { label, required, helperText } = element.extraAttributes;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name; // Ambil nama file pertama
      setValue(fileName); // Simpan sebagai string
    } else {
      setValue(null); // Atur ke null jika tidak ada file
    }
  };
  

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className={cn(error && "text-red-500")}>
        {label}
        {required && "*"}
      </Label>
      <input
        type="file"
        className={cn(error && "border-red-500")}
        onChange={handleFileChange}
        onBlur={() => {
          if (!submitValue) return;
          const stringValue = value ? value : "false";
          const valid = ImageFieldFormElement.validate(element, stringValue);
          setError(!valid);
          if (!valid) return;
          submitValue(element.id, value || ""); // Kirimkan string
        }}
        
      />
      {helperText && <p className={cn("text-muted-foreground text-[0.8rem]", error && "text-red-500")}>{helperText}</p>}
    </div>
  );
}

function PropertiesComponent({ elementInstance }: { elementInstance: any }) {
  const element = elementInstance;
  const { updateElement } = useDesigner();
  const form = useForm<FieldValues>({
    resolver: zodResolver(propertiesSchema),
    mode: "onBlur",
    defaultValues: {
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      required: element.extraAttributes.required,
    },
  });

  useEffect(() => {
    form.reset(element.extraAttributes);
  }, [element, form]);

  function applyChanges(values: FieldValues) {
    const { label, helperText, required } = values;
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        label,
        helperText,
        required,
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onBlur={form.handleSubmit(applyChanges)}
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="space-y-3"
      >
        <FormField
          control={form.control}
          name="label"
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
                The label of the field. <br /> It will be displayed above the field.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="required"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Required</FormLabel>
                <FormDescription>
                  Whether this field is required or not.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
