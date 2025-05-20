"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// Import your booking store (adjust the path as necessary)
import { useBookingStore } from "@/store/bookingStore";

// Add the PassengerFormProps interface
interface PassengerFormProps {
  adults: number;
  children: number;
  infants: number;
  onValidityChange?: (isValid: boolean) => void;
}

// Update the schema to make passport and nationality required for all passenger types
const passengerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    required_error: "Please select a gender",
  }),
  // Make passport and nationality required
  passportNumber: z.string().min(1, "Passport number is required"),
  nationality: z.string().min(1, "Nationality is required"),
  // Keep email and phone optional for infants
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  specialRequests: z.string().optional().or(z.literal("")),
});

//
// Schema for the entire form
//
const formSchema = z.object({
  passengers: z.array(passengerSchema),
});

export default function PassengerForm({
  adults = 1,
  children = 0,
  infants = 0,
  onValidityChange,
}: PassengerFormProps) {
  const { updatePassengers, temporaryBooking } = useBookingStore();

  // Add useEffect to restore passenger data from localStorage
  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("current_user") || "{}"
    );
    if (currentUser.id) {
      const savedData = JSON.parse(
        localStorage.getItem(`user_data_${currentUser.id}_booking`) || "{}"
      );

      if (savedData.passengers && savedData.passengers.length > 0) {
        updatePassengers(savedData.passengers);
      }
    }
  }, [updatePassengers]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passengers:
        temporaryBooking.passengers.length > 0
          ? temporaryBooking.passengers
          : Array(adults + children + infants).fill({
              firstName: "",
              lastName: "",
              dateOfBirth: "",
              gender: undefined,
              passportNumber: "",
              nationality: "",
              email: "",
              phone: "",
              specialRequests: "",
            }),
    },
    mode: "all",
  });

  // Update store when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.passengers) {
        const typedPassengers = value.passengers.map((passenger, index) => ({
          ...passenger,
          type:
            index < adults
              ? "ADULT"
              : index < adults + children
              ? "CHILD"
              : "INFANT",
        }));
        updatePassengers(typedPassengers);

        // Save to localStorage
        const currentUser = JSON.parse(
          localStorage.getItem("current_user") || "{}"
        );
        if (currentUser.id) {
          const savedData = JSON.parse(
            localStorage.getItem(`user_data_${currentUser.id}_booking`) || "{}"
          );

          localStorage.setItem(
            `user_data_${currentUser.id}_booking`,
            JSON.stringify({
              ...savedData,
              passengers: typedPassengers,
              lastUpdated: new Date().toISOString(),
            })
          );
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, updatePassengers, adults, children]);

  // Trigger validation on mount and when stored data changes
  useEffect(() => {
    if (temporaryBooking.passengers.length > 0) {
      form.trigger().then((isValid) => {
        onValidityChange?.(isValid);
      });
    }
  }, [form, onValidityChange, temporaryBooking.passengers]);

  // Validity check effect
  useEffect(() => {
    const validateForm = async () => {
      const result = await form.trigger();
      onValidityChange?.(result);
    };

    validateForm();

    const subscription = form.watch(() => {
      validateForm();
    });

    return () => subscription.unsubscribe();
  }, [form, onValidityChange]);

  const renderPassengerForms = () => {
    const elements = [];
    let index = 0;

    // Render Adult sections
    for (let i = 0; i < adults; i++) {
      elements.push(
        <PassengerFormSection
          key={`adult-${i}`}
          index={index}
          type="ADULT"
          number={i + 1}
          form={form}
        />
      );
      index++;
    }

    // Render Child sections
    for (let i = 0; i < children; i++) {
      elements.push(
        <PassengerFormSection
          key={`child-${i}`}
          index={index}
          type="CHILD"
          number={i + 1}
          form={form}
        />
      );
      index++;
    }

    // Render Infant sections
    for (let i = 0; i < infants; i++) {
      elements.push(
        <PassengerFormSection
          key={`infant-${i}`}
          index={index}
          type="INFANT"
          number={i + 1}
          form={form}
        />
      );
      index++;
    }

    return elements;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Passenger Information
        </h2>
        <p className="text-muted-foreground">
          Please enter the details for all passengers
        </p>
      </div>

      {/* The Form component provides the react-hook-form context.
          Note: We do not include an extra nested <form> element so that the context is preserved. */}
      <Form {...form}>
        <Accordion type="single" collapsible className="w-full">
          {renderPassengerForms()}
        </Accordion>
      </Form>
    </div>
  );
}

function PassengerFormSection({
  index,
  type,
  number,
  form,
}: {
  index: number;
  type: "ADULT" | "CHILD" | "INFANT";
  number: number;
  form: ReturnType<typeof useForm>;
}) {
  // Add this utility function for proper text case
  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getPassengerLabel = (t: string, n: number) => {
    if (t === "ADULT") return `Adult ${n}`;
    if (t === "CHILD") return `Child (2-12 years) ${n}`;
    if (t === "INFANT") return `Infant (0-2 years) ${n}`;
    return `Passenger ${n}`;
  };

  // Helper to add required indicator or optional text
  const getLabel = (field: string, required: boolean) =>
    required ? `${field} *` : `${field} (optional)`;

  // Update the effect to handle both phone and email for infants
  useEffect(() => {
    if (type === "INFANT") {
      // Get the first adult's contact details
      const adultPhoneNumber = form.getValues("passengers.0.phone");
      const adultEmail = form.getValues("passengers.0.email");

      // Set initial values
      if (adultPhoneNumber) {
        form.setValue(`passengers.${index}.phone`, adultPhoneNumber);
      }
      if (adultEmail) {
        form.setValue(`passengers.${index}.email`, adultEmail);
      }

      // Subscribe to changes in adult's contact details
      const subscription = form.watch((value, { name }) => {
        if (name === "passengers.0.phone") {
          form.setValue(`passengers.${index}.phone`, value.passengers[0].phone);
        }
        if (name === "passengers.0.email") {
          form.setValue(`passengers.${index}.email`, value.passengers[0].email);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [form, index, type]);

  return (
    <AccordionItem value={`passenger-${index}`}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex flex-col items-start">
          <span className="font-semibold">
            {getPassengerLabel(type, number)}
          </span>
          <span className="text-sm text-muted-foreground">
            Enter passenger details
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`passengers.${index}.firstName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getLabel("First Name", true)}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter first name"
                      {...field}
                      onChange={(e) => {
                        const formattedValue = toTitleCase(e.target.value);
                        field.onChange(formattedValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`passengers.${index}.lastName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getLabel("Last Name", true)}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter last name"
                      {...field}
                      onChange={(e) => {
                        const formattedValue = toTitleCase(e.target.value);
                        field.onChange(formattedValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`passengers.${index}.dateOfBirth`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getLabel("Date of Birth", true)}</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      max={new Date().toISOString().split("T")[0]} // Prevents future dates
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`passengers.${index}.gender`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getLabel("Gender", true)}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Passport and Nationality fields - required for all passenger types */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`passengers.${index}.passportNumber`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getLabel("Passport Number", true)}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter passport number"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`passengers.${index}.nationality`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getLabel("Nationality", true)}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter nationality"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Contact fields - auto-filled for infants */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`passengers.${index}.email`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getLabel("Email", type !== "INFANT")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter email address"
                      {...field}
                      readOnly={type === "INFANT"}
                      className={
                        type === "INFANT" ? "cursor-not-allowed bg-muted" : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`passengers.${index}.phone`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {getLabel("Phone Number", type !== "INFANT")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter phone number"
                      {...field}
                      readOnly={type === "INFANT"}
                      className={
                        type === "INFANT" ? "cursor-not-allowed bg-muted" : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`passengers.${index}.specialRequests`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{getLabel("Special Requests", false)}</FormLabel>
                <FormControl>
                  <Input placeholder="Enter any special requests" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
