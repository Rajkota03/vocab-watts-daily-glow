
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  isPro: z.boolean(),
  category: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

interface SubscriptionFormProps {
  subscription: {
    id: string;
    phone_number: string;
    is_pro: boolean;
    category?: string;
  };
  isLoading: boolean;
  isDeleting: boolean;
  onSubmit: (values: FormValues) => void;
}

export function SubscriptionForm({
  subscription,
  isLoading,
  isDeleting,
  onSubmit
}: SubscriptionFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isPro: subscription?.is_pro || false,
      category: subscription?.category || '',
    },
  });
  
  // Reset form when subscription changes
  React.useEffect(() => {
    form.reset({
      isPro: subscription.is_pro,
      category: subscription.category || '',
    });
  }, [subscription, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="isPro"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Pro Subscription</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable or disable pro features
                </div>
              </div>
              <FormControl>
                <Switch 
                  checked={field.value} 
                  onCheckedChange={field.onChange} 
                  disabled={isLoading || isDeleting} 
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {form.watch("isPro") && (
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter category" disabled={isLoading || isDeleting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <Alert>
          <AlertDescription>
            Phone Number: {subscription.phone_number}
          </AlertDescription>
        </Alert>
      </form>
    </Form>
  );
}
