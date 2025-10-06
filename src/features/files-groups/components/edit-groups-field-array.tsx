import { PlusIcon, TrashIcon } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { IGroupEditForm } from "@/features/files-groups/components/group-select";

export const EditGroupsFieldArray = () => {
  const form = useFormContext<IGroupEditForm>();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "groups",
  });

  return (
    <div className="flex flex-col w-full gap-2">
      {fields.map((field, idx) => (
        <FormField
          key={field.id}
          control={form.control}
          name={`groups.${idx}.name`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <InputGroup>
                  <InputGroupInput placeholder="nazwa grupy" {...field} />

                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => remove(idx)}
                    >
                      <TrashIcon />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
      ))}

      <Button
        type="button"
        size="icon"
        onClick={() =>
          append({
            name: "",
          })
        }
        className="self-end"
        variant="outline"
      >
        <PlusIcon />
      </Button>
    </div>
  );
};
