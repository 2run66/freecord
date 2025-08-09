"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { useModal } from "@/hooks/use-modal-store";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required."
  }),
  imageUrl: z.string().optional()
});

interface InitialModalProps {
  autoOpen?: boolean;
}

export const InitialModal = ({ autoOpen = false }: InitialModalProps) => {
  const { isOpen, onClose, type, onOpen, setupCompleted, setSetupCompleted } = useModal();
  const [isMounted, setIsMounted] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);
  const router = useRouter();

  // Check if modal should be open (either from modal store or forced for setup page)
  const isModalOpen = (isOpen && type === "createServer") || forceOpen;

  useEffect(() => {
    setIsMounted(true);
    // Only auto-open modal if explicitly requested (for setup page) AND setup not completed
    if (autoOpen && !setupCompleted) {
      const timer = setTimeout(() => {
        if (!isOpen) {
          setForceOpen(true);
          onOpen("createServer");
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onOpen, autoOpen, setupCompleted]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/servers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const server = await response.json();
        form.reset();
        setForceOpen(false);
        setSetupCompleted(true); // Mark setup as completed
        onClose();
        // Redirect to the newly created server
        router.push(`/servers/${server.id}`);
      } else {
        console.error("Failed to create server");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleClose = () => {
    form.reset();
    setForceOpen(false);
    onClose();
  }

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card text-foreground p-0 overflow-hidden border-border">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Create Your First Server
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Your server is where you and your friends hang out. Make yours and start talking!
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint="serverImage"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-muted-foreground">
                      Server name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-input border-border focus-visible:ring-2 focus-visible:ring-ring text-foreground"
                        placeholder="Enter server name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
                    <DialogFooter className="bg-muted px-6 py-4 flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={handleClose} disabled={isLoading} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" disabled={isLoading} className="flex-1">
              Create
            </Button>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Already have an invite code?
            </p>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => {
                setForceOpen(false);
                onClose();
                onOpen("joinServer");
              }}
              disabled={isLoading}
              className="w-full"
            >
              Join a Server
            </Button>
          </div>
        </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}