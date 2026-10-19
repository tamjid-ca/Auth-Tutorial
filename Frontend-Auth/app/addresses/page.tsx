"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AuthGuard } from "@/components/auth-guard";
import { addressApi } from "@/lib/api";
import { Address } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/animate-ui/components/radix/alert-dialog";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/animate-ui/components/animate/tooltip";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Home,
  Briefcase,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Phone,
  User,
  X,
} from "lucide-react";

// ── Zod Validation Schema ─────────────────────────────────────────────────
const addressSchema = z.object({
  label: z.enum(["home", "work", "other"]),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Please enter a valid phone number"),
  addressLine1: z
    .string()
    .min(3, "Address line 1 must be at least 3 characters")
    .max(200, "Address line 1 must be at most 200 characters"),
  addressLine2: z.string().max(200, "Address line 2 must be at most 200 characters").optional(),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be at most 100 characters"),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(100, "State must be at most 100 characters"),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .regex(/^[A-Za-z0-9\s-]{3,10}$/, "Please enter a valid postal code"),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must be at most 100 characters"),
  isDefault: z.boolean().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

const LABEL_CONFIG = {
  home: { icon: Home, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  work: { icon: Briefcase, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  other: { icon: MoreHorizontal, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-500/10 border-gray-500/20" },
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "home",
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      isDefault: false,
    },
  });

  const { isSubmitting } = form.formState;

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await addressApi.getAll();
      setAddresses(data.addresses);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch addresses.";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const resetForm = () => {
    form.reset({
      label: "home",
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      isDefault: false,
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    form.reset({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setShowForm(true);
    setStatusMessage(null);
  };

  const onSubmit = async (values: AddressFormValues) => {
    setStatusMessage(null);
    try {
      if (editingAddress) {
        await addressApi.update(editingAddress._id, {
          ...values,
          addressLine2: values.addressLine2 || "",
        });
        setStatusMessage({ type: "success", text: "Address updated successfully." });
      } else {
        await addressApi.create({
          ...values,
          addressLine2: values.addressLine2 || "",
        });
        setStatusMessage({ type: "success", text: "Address created successfully." });
      }
      resetForm();
      await fetchAddresses();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save address.";
      setStatusMessage({ type: "error", text: msg });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setStatusMessage(null);
    try {
      await addressApi.delete(deleteTarget._id);
      setStatusMessage({ type: "success", text: "Address deleted successfully." });
      setDeleteOpen(false);
      setDeleteTarget(null);
      await fetchAddresses();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete address.";
      setStatusMessage({ type: "error", text: msg });
      setDeleteOpen(false);
    }
  };

  const handleSetDefault = async (address: Address) => {
    if (address.isDefault) return;
    setStatusMessage(null);
    try {
      await addressApi.update(address._id, { isDefault: true });
      setStatusMessage({ type: "success", text: `"${address.label}" address set as default.` });
      await fetchAddresses();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to set default address.";
      setStatusMessage({ type: "error", text: msg });
    }
  };

  return (
    <AuthGuard>
      <TooltipProvider>
        <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <MapPin className="h-3 w-3" />
                  Address Book
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  Max 10 addresses
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                My Addresses
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your saved addresses. Your default address is highlighted.
              </p>
            </div>

            <Button
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setEditingAddress(null);
                  form.reset();
                  setShowForm(true);
                  setStatusMessage(null);
                }
              }}
              size="sm"
              variant={showForm ? "outline" : "default"}
              className="flex items-center gap-1.5 shadow-xs"
            >
              {showForm ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Address
                </>
              )}
            </Button>
          </div>

          {/* Status Alert */}
          {statusMessage && (
            <Alert
              className={
                statusMessage.type === "success"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                  : "border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300"
              }
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600" />
              )}
              <AlertTitle>
                {statusMessage.type === "success" ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription>{statusMessage.text}</AlertDescription>
            </Alert>
          )}

          {/* Address Form */}
          {showForm && (
            <Card className="shadow-xs border-border/80 bg-card/90 backdrop-blur-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  {editingAddress ? (
                    <>
                      <Pencil className="h-4 w-4 text-primary" />
                      Edit Address
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 text-primary" />
                      New Address
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {editingAddress
                    ? "Update the address fields below and save your changes."
                    : "Fill in the details below to add a new address to your account."}
                </CardDescription>
              </CardHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-4">
                    {/* Label Selector */}
                    <FormField
                      control={form.control}
                      name="label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Type</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              {(["home", "work", "other"] as const).map((label) => {
                                const config = LABEL_CONFIG[label];
                                const Icon = config.icon;
                                return (
                                  <Button
                                    key={label}
                                    type="button"
                                    variant={field.value === label ? "default" : "outline"}
                                    size="sm"
                                    className="flex items-center gap-1.5 capitalize"
                                    onClick={() => field.onChange(label)}
                                  >
                                    <Icon className="h-3.5 w-3.5" />
                                    {label}
                                  </Button>
                                );
                              })}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Full Name & Phone row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John Doe"
                                disabled={isSubmitting}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+1 (555) 123-4567"
                                disabled={isSubmitting}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Address Lines */}
                    <FormField
                      control={form.control}
                      name="addressLine1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 1</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123 Main Street"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="addressLine2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Address Line 2{" "}
                            <span className="text-muted-foreground font-normal">(Optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Apt 4B, Suite 200, etc."
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* City, State, Postal Code row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="New York"
                                disabled={isSubmitting}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State / Province</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="NY"
                                disabled={isSubmitting}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="10001"
                                disabled={isSubmitting}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Country */}
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="United States"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Default Address Toggle */}
                    <FormField
                      control={form.control}
                      name="isDefault"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-3">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value || false}
                                onChange={field.onChange}
                                disabled={isSubmitting}
                                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                              />
                            </FormControl>
                            <FormLabel className="cursor-pointer flex items-center gap-1.5">
                              <Star className="h-3.5 w-3.5 text-amber-500" />
                              Set as default address
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>

                  <CardFooter className="flex gap-3 pt-2 border-t border-border/40">
                    <LiquidButton
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          {editingAddress ? "Update Address" : "Save Address"}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </LiquidButton>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetForm}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          )}

          {/* Address List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading addresses...</span>
            </div>
          ) : addresses.length === 0 ? (
            <Card className="border-dashed border-border/80 bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-16 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground">
                  <MapPin className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  No addresses saved yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Click &quot;Add Address&quot; to save your first address.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => {
                const config = LABEL_CONFIG[address.label] || LABEL_CONFIG.other;
                const LabelIcon = config.icon;

                return (
                  <Card
                    key={address._id}
                    className={`shadow-xs border-border/80 transition-all hover:shadow-md ${
                      address.isDefault
                        ? "ring-2 ring-primary/30 border-primary/40"
                        : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg}`}
                          >
                            <LabelIcon className={`h-3 w-3 ${config.color}`} />
                            <span className={`capitalize ${config.color}`}>
                              {address.label}
                            </span>
                          </span>
                          {address.isDefault && (
                            <Badge
                              variant="default"
                              className="text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10"
                            >
                              <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {!address.isDefault && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-amber-500"
                                  onClick={() => handleSetDefault(address)}
                                >
                                  <Star className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Set as default</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                                onClick={() => handleEdit(address)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit address</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => {
                                  setDeleteTarget(address);
                                  setDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete address</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-2 text-sm pb-4">
                      <div className="flex items-start gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="font-medium text-foreground">
                          {address.fullName}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{address.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="text-muted-foreground">
                          <p>{address.addressLine1}</p>
                          {address.addressLine2 && (
                            <p>{address.addressLine2}</p>
                          )}
                          <p>
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p>{address.country}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* API Info Footer */}
          {addresses.length > 0 && (
            <div className="text-center text-xs text-muted-foreground pt-2">
              Showing {addresses.length} of 10 max addresses •{" "}
              <span className="font-mono">
                GET /api/users/addresses
              </span>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Address?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the{" "}
                  <span className="font-semibold capitalize">
                    {deleteTarget?.label}
                  </span>{" "}
                  address for{" "}
                  <span className="font-semibold">{deleteTarget?.fullName}</span>?
                  {deleteTarget?.isDefault && (
                    <span className="block mt-1 text-amber-600 dark:text-amber-400">
                      This is your default address. The most recent remaining address will become the new default.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Address
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TooltipProvider>
    </AuthGuard>
  );
}
